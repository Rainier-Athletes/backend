
import StudentData from '../../model/student-data';
import { createPointTrackerMockPromise, removeAllResources as removePtResources } from './point-tracker-mock';

const createStudentDataMockPromise = async () => {
  const mock = await createPointTrackerMockPromise();
  const { pointTracker, profileData } = mock;
  
  const mockData = {};

  const connectStudent = async (student, adult) => {
    adult.students.push(student._id.toString());
    return adult.save();
  };

  await connectStudent(profileData.studentProfile, profileData.coachProfile);
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
    teachers: pointTracker.subjects.map((s) => {
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
    gender: 'male',
    school: [{ 
      schoolName: 'Odle Middle School',
      isElementarySchool: false,
      currentSchool: true, 
    }],
    dateOfBirth: '2007-09-11',
    grade: 7,
    synopsisReportArchiveUrl: 'http://www.google.com',
    googleCalendarUrl: 'http://www.google.com',
    googleDocsUrl: 'http://www.google.com',
    synergy: {
      username: 'SynergyUser',
      password: Buffer.from('password').toString('base64'),
    },
  };
  
  const newStudentData = new StudentData(mockStudentData);
  const studentData = await newStudentData.save();

  mockData.profileData = profileData;
  mockData.pointTracker = pointTracker;
  mockData.studentData = studentData;

  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    StudentData.remove({}),
    removePtResources(),
  ]);
};

export { createStudentDataMockPromise, removeAllResources };
