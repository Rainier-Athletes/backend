// import multer from 'multer';
// import fs from 'fs-extra';
import { Router } from 'express';
import HttpErrors from 'http-errors';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import Profile from '../model/profile';
// import { s3Upload, s3Remove } from '../lib/s3';
import logger from '../lib/logger';

// const multerUpload = multer({ dest: `${__dirname}/../temp` });

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
  if (!['mentor', 'coach', 'teacher', 'family'].includes(role)) {
    return next(new HttpErrors(400, 'ATTACH ROUTER GET ERROR: missing valid role query parameter', { expose: false }));
  }
  // at this point query parameters and user's role are good.
  logger.log(logger.INFO, `ATTACH ROUTER GET: attaching student ${request.query.student} to ${role}=${request.query[role]}`);

  // retrieve student and support role profiles
  let studentProfile;
  let roleProfile;
  try {
    studentProfile = await Profile.findById(request.query.student);
  } catch (err) {
    return next(new HttpErrors(404, 'ATTACH ROUTER GET: unable to find student profile', { expose: false }));
  }
  try {
    roleProfile = await Profile.findById(request.query[role]);
  } catch (err) {
    return next(new HttpErrors(404, 'ATTACH ROUTER GET: unable to find support role profile', { expose: false }));
  }

  // update student support role with student's id
  const dataArray = roleProfile.students;
  if (!dataArray.map(id => id.toString()).includes(studentProfile._id.toString())) dataArray.push(request.query.student);

  // update student to reference support role's profile _id
  switch (role) {
    case 'mentor':
      studentProfile.studentData.mentor = roleProfile._id;
      break;
    case 'coach':
      if (!(studentProfile.studentData.coaches.map(v => v.toString()).includes(request.query[role]))) {
        studentProfile.studentData.coaches.push(request.query[role]);
      }
      break;
    case 'teacher':
      if (!(studentProfile.studentData.teachers.map(v => v.toString()).includes(request.query[role]))) {
        studentProfile.studentData.teachers.push(request.query[role]);
      }
      break;
    case 'family':
      if (!(studentProfile.studentData.family.map(v => v.toString()).includes(request.query[role]))) {
        studentProfile.studentData.family.push(request.query[role]);
      }
      break;
    default:
  }

  // save updated profiles for student and supporter
  try {
    await roleProfile.save();
    await studentProfile.save();
    return response.sendStatus(200);
  } catch (err) {
    return new HttpErrors(500, 'ATTACH ROUTER GET: Unable to save updated profiles');
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
  if (!['mentor', 'coach', 'teacher', 'family'].includes(role)) {
    return next(new HttpErrors(400, 'DETACH ROUTER GET ERROR: missing valid role query parameter', { expose: false }));
  }
  
  logger.log(logger.INFO, `DETACH ROUTER GET: detaching student ${request.query.student} from ${role}=${request.query[role]}`);

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
  const newDataArray = dataArray.map(id => id.toString()).filter(id => id !== request.query.student);
  roleProfile.students = newDataArray;

  // now remove support role ID from student profile.
  let newSupportersArray;
  switch (role) {
    case 'mentor':
      studentProfile.studentData.mentor = null;
      break;
    case 'coach':
      newSupportersArray = studentProfile.studentData.coaches.map(id => id.toString()).filter(id => id !== request.query[role]);
      studentProfile.studentData.coaches = newSupportersArray;
      break;
    case 'teacher':
      newSupportersArray = studentProfile.studentData.teachers.map(id => id.toString()).filter(id => id !== request.query[role]);
      studentProfile.studentData.teachers = newSupportersArray;
      break;
    case 'family':
      newSupportersArray = studentProfile.studentData.family.map(id => id.toString()).filter(id => id !== request.query[role]);
      studentProfile.studentData.family = newSupportersArray;
      break;
    default:
  }

  try {
    await roleProfile.save();
    await studentProfile.save();
    return response.sendStatus(200);
  } catch (err) {
    return new HttpErrors(500, 'ATTACH ROUTER GET: Unable to save updated profiles', { expose: false });
  }
});

export default relationshipRouter;
