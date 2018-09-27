import { Router } from 'express';
import HttpErrors from 'http-errors';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import Profile from '../model/profile';
import StudentData from '../model/student-data';

const emptyStudentData = {
  student: null,
  lastPointTracker: null,
  coaches: [],
  sports: [],
  mentors: [],
  teachers: [],
  family: [],
  gender: '',
  school: [],
  dateOfBirth: '',
  grade: 0,
  synopsisReportArchiveUrl: 'http://www.google.com',
  googleCalendarUrl: 'http://www.google.com',
  googleDocsUrl: 'http://www.google.com',
  synergy: {},
};

const relationshipRouter = new Router();

// attach student to support role profile and support role profile to student
relationshipRouter.get('/api/v1/attach', bearerAuthMiddleware, async (request, response, next) => {
  if (!request.profile) {
    return next(new HttpErrors(400, 'ATTACH ROUTER GET ERROR: invalid request, not logged in.', { expose: false }));
  }
  if (request.profile.role !== 'admin' && request.profile.role !== 'mentor') {
    return next(new HttpErrors(401, 'ATTACH ROUTER GET ERROR: user not authorized.', { expose: false }));
  }
  // query string is of the form ?student=12345&[mentor|coach|teacher|family]=123456
  const queryKeys = Object.keys(request.query);
  if (queryKeys.length === 0) {
    return next(new HttpErrors(400, 'ATTACH ROUTER GET ERROR: missing query parameters', { expose: false }));
  }
  if (!request.query.student) {
    return next(new HttpErrors(400, 'ATTACH ROUTER GET ERROR: missing student id query parameter', { expose: false }));
  }

  const role = queryKeys.filter(k => k !== 'student')[0];
  if (!['mentor', 'coach', 'teacher', 'family', 'admin'].includes(role)) {
    return next(new HttpErrors(400, 'ATTACH ROUTER GET ERROR: missing valid role query parameter', { expose: false }));
  }
  // at this point query parameters and user's role are good.

  // retrieve student data and support role profile
  let studentData;
  let roleProfile;
  try {
    studentData = await StudentData.findOne({ student: request.query.student });
  } catch (err) {
    return next(new HttpErrors(404, 'ATTACH ROUTER GET: unable to find student data', { expose: false }));
  }

  if (!studentData) {
    studentData = await new StudentData(emptyStudentData);
    studentData.student = request.query.student;
  }

  try {
    roleProfile = await Profile.findById(request.query[role]);
  } catch (err) {
    return next(new HttpErrors(404, 'ATTACH ROUTER GET: unable to find support role profile', { expose: false }));
  }

  // update student support role with student's id
  if (!roleProfile.students.map(s => s._id.toString()).includes(request.query.student)) {
    roleProfile.students.push(request.query.student);
  }

  // update student's data to reference support role's profile _id
  switch (role) {
    case 'mentor':
      // set currentMentor to false on all current mentors
      studentData.mentors.forEach((m) => { m.currentMentor = false; });

      if (!(studentData.mentors.map(v => v.mentor._id.toString()).includes(request.query[role]))) {
        // push new mentor connection (as currentMentor) into student's mentors array
        studentData.mentors.unshift({ mentor: request.query[role], currentMentor: true });
      } else {
        // mentor is already in the student's array. Set them to currentMentor
        studentData.mentors.forEach((m) => {
          if (m.mentor._id.toString() === request.query[role]) m.currentMentor = true;
        });
      }
      break;
    case 'coach':
      if (!(studentData.coaches.map(v => v.coach._id.toString()).includes(request.query[role]))) {
        studentData.coaches.push({ coach: request.query[role], currentCoach: true });
      } else {
        studentData.coaches.forEach((c) => {
          if (c.coach._id.toString() === request.query[role]) c.currentCoach = true;
        });
      }
      break;
    case 'teacher':
      if (!(studentData.teachers.map(v => v.teacher._id.toString()).includes(request.query[role]))) {
        studentData.teachers.push({ teacher: request.query[role], currentTeacher: true });
      } else {
        studentData.teachers.forEach((c) => {
          if (c.teacher._id.toString() === request.query[role]) c.currentTeacher = true;
        });
      }
      break;
    case 'family':
      if (!(studentData.family.map(v => v.member._id.toString()).includes(request.query[role]))) {
        studentData.family.push({ member: request.query[role] });
      }
      break;
    default:
  }

  // save updated profiles for student and supporter
  try {
    await roleProfile.save();
    await studentData.save();
    return response.sendStatus(200);
  } catch (err) {
    return new HttpErrors(500, 'ATTACH ROUTER GET: Unable to save updated student data/support profile');
  }
});

// detach student from support role profile and support profile from student
relationshipRouter.get('/api/v1/detach', bearerAuthMiddleware, async (request, response, next) => {
  if (!request.profile) {
    return next(new HttpErrors(400, 'DETACH ROUTER GET ERROR: invalid request, not logged in.', { expose: false }));
  }
  if (request.profile.role !== 'admin' && request.profile.role !== 'mentor') {
    return next(new HttpErrors(401, 'DETACH ROUTER GET ERROR: user not authorized.', { expose: false }));
  }
  // query string is of the form ?student=12345&[mentor|coach|teacher|family]=123456
  const queryKeys = Object.keys(request.query);
  if (queryKeys.length === 0) {
    return next(new HttpErrors(400, 'DETACH ROUTER GET ERROR: missing query parameters', { expose: false }));
  }
  if (!request.query.student) {
    return next(new HttpErrors(400, 'DETACH ROUTER GET ERROR: missing student id query parameter', { expose: false }));
  }

  const role = queryKeys.filter(k => k !== 'student')[0];
  if (!['mentor', 'coach', 'teacher', 'family', 'admin'].includes(role)) {
    return next(new HttpErrors(400, 'DETACH ROUTER GET ERROR: missing valid role query parameter', { expose: false }));
  }

  let studentProfile;
  let roleProfile;
  try {
    studentProfile = await Profile.findById(request.query.student);
  } catch (err) {
    return next(new HttpErrors(404, 'DETACH ROUTER GET: unable to find student profile', { expose: false }));
  }
  try {
    roleProfile = await Profile.findById(request.query[role]);
  } catch (err) {
    return next(new HttpErrors(404, 'DETACH ROUTER GET: unable to find support role profile', { expose: false }));
  }

  // remove student's id from support role profile
  const dataArray = roleProfile.students;
  const newDataArray = dataArray.map(s => s._id.toString()).filter(id => id !== request.query.student);
  roleProfile.students = newDataArray;

  // now remove support role ID from student profile.
  let newSupportersArray;
  let found = false;
  switch (role) {
    case 'mentor':
      studentProfile.studentData.mentors.forEach((m) => {
        if (m.mentor._id.toString() === request.query[role]) {
          m.currentMentor = false;
          found = true;
        }
      });
      break;
    case 'coach':
      studentProfile.studentData.coaches.forEach((c) => {
        if (c.coach._id.toString() === request.query[role]) {
          c.currentCoach = false;
          found = true;
        }
      });
      break;
    case 'teacher':
      studentProfile.studentData.teachers.forEach((t) => {
        if (t.teacher._id.toString() === request.query[role]) {
          t.currentTeacher = false;
          found = true;
        }
      });
      break;
    case 'family':
      newSupportersArray = studentProfile.studentData.family.filter((f) => {
        return f.member._id.toString() !== request.query[role];
      });
      studentProfile.studentData.family = newSupportersArray;
      break;
    default:
  }

  if (!found) return new HttpErrors(404, `${role} ${request.query[role]} not found on student ${request.query.student}`, { expose: false });

  try {
    await roleProfile.save();
    await studentProfile.studentData.save();
    return response.sendStatus(200);
  } catch (err) {
    return new HttpErrors(500, 'ATTACH ROUTER GET: Unable to save updated profiles', { expose: false });
  }
});

export default relationshipRouter;
