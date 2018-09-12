
import StudentData from '../../model/student-data';
import { createPointTrackerMockPromise, removeAllResources as removePtResources } from './point-tracker-mock';

const createStudentDataMockPromise = async () => {
  const mock = await createPointTrackerMockPromise();
  const mockPt = mock.pointTracker;
  const mockProfiles = mock.profileData;
  const mockData = {};

  const mockStudentData = {
    student: mockProfiles.studentProfile._id,
    lastPointTracker: mockPt._id,
    coaches: [{ 
      coach: mockProfiles.coachProfile._id, 
      currentCoach: true,
    }],
    sports: [{
      sportName: 'baseball',
      team: 'Mariners',
      league: 'Bellevue Parks',
      currentlyPlaying: true,
    }],
    mentors: [{
      mentor: mockProfiles.mentorProfile._id,
      currentMentor: true,
    }],
    teachers: mockPt.subjects.map((s) => {
      return {
        teacher: s.teacher,  
        currentTeacher: true,
      };
    }),
    family: [
      {
        member: mockProfiles.adminProfile._id,
        weekdayGuardian: true,
        weekendGuardian: false,
      },
      {
        member: mockProfiles.mentorProfile._id,
        weekdayGuardian: false,
        weekendGuardian: true,
      },
    ],
    gender: 'male',
    school: [{ 
      schoolName: 'Odle Middle School', 
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

  mockData.profiles = mockProfiles;
  mockData.pointTracker = mockPt;
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
