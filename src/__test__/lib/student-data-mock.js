
import StudentData from '../../model/student-data';

import { createPointTrackerMockPromise, removeAllResources as removePtResources } from './point-tracker-mock';

const createStudentDataMockPromise = async (elementaryStudent = false) => {
  const mock = await createPointTrackerMockPromise(elementaryStudent);
  const { pointTracker, profileData } = mock;
  
  const mockData = {};

  const connectStudent = async (student, adult) => {
    adult.students.push(student._id.toString());
    return adult.save();
  };

  try {
    await connectStudent(profileData.studentProfile, profileData.coachProfile);
  } catch (err) {
    console.log('connectStudent error on save:', err);
  }
  await connectStudent(profileData.studentProfile, profileData.mentorProfile);
  await connectStudent(profileData.studentProfile, profileData.family1Profile);
  await connectStudent(profileData.studentProfile, profileData.family2Profile);
  
  const mockStudentData = {
    student: profileData.studentProfile._id,
    lastPointTracker: pointTracker._id,
    coaches: [{ 
      coach: profileData.coachProfile._id, 
      currentCoach: true,
    }],
    sports: [{
      sport: 'baseball',
      team: 'Mariners',
      league: 'Bellevue Parks',
      currentlyPlaying: true,
    }],
    mentors: [{
      mentor: profileData.mentorProfile._id,
      currentMentor: true,
    }],
    teachers: elementaryStudent 
      ? {
        teacher: pointTracker.subjects[0].teacher,
        currentTeacher: true,
      }
      : pointTracker.subjects.map((s) => {
        return {
          teacher: s.teacher,  
          currentTeacher: true,
        };
      }),
    family: [
      {
        member: profileData.family1Profile._id,
        weekdayGuardian: true,
        weekendGuardian: false,
      },
      {
        member: profileData.family2Profile._id,
        weekdayGuardian: false,
        weekendGuardian: true,
      },
    ],
    gender: elementaryStudent ? 'male' : 'female',
    school: [{
      schoolName: 'Stevens Elemetary School',
      isElementarySchool: true,
      currentSchool: elementaryStudent,
    },
    { 
      schoolName: 'Odle Middle School',
      isElementarySchool: false,
      currentSchool: !elementaryStudent, 
    }],
    dateOfBirth: elementaryStudent ? '2010-09-20' : '2007-09-11',
    grade: elementaryStudent ? 5 : 7,
    synopsisReportArchiveUrl: 'http://www.google.com',
    googleCalendarUrl: 'http://www.google.com',
    googleDocsUrl: 'http://www.google.com',
    synergy: {
      username: 'SynergyUser',
      password: Buffer.from('password').toString('base64'),
    },
  };
  
  const newStudentData = new StudentData(mockStudentData);
  let studentData;
  try {
    studentData = await newStudentData.save();
  } catch (err) {
    console.log(' save error:', err);
  }

  mockData.profileData = profileData;
  mockData.pointTracker = pointTracker;
  mockData.studentData = studentData;

  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    removePtResources(),
    StudentData.deleteMany({}),
  ]);
};

export { createStudentDataMockPromise, removeAllResources };
