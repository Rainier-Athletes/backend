import faker from 'faker';
import PointTracker from '../../model/point-tracker';
import { createProfileMockPromise, removeAllResources as removeProfileResources } from './profile-mock';

const randomVal = (min, max) => {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
};

const randomGrade = () => {
  const grades = ['A', 'B', 'C', 'D'];
  return grades[randomVal(0, grades.length - 1)];
};

const createPointTrackerMockPromise = async (elementaryStudent = false) => {
  const mockData = {};

  const profileData = await createProfileMockPromise();

  mockData.profileData = profileData;


  const getTeacher = async () => {
    const mock = await createProfileMockPromise();
    mock.teacherProfile.students.push(mockData.profileData.studentProfile._id.toString());
    await mock.teacherProfile.save();
    return mock.teacherProfile._id.toString();
  };

  const teachers = [];
  teachers.push(await getTeacher());
  if (!elementaryStudent) {
    teachers.push(await getTeacher());
    teachers.push(await getTeacher());
    teachers.push(await getTeacher());
    teachers.push(await getTeacher());
    teachers.push(await getTeacher());
    teachers.push(await getTeacher());
  }

  const mockPointTracker = {
    title: 'Mock Point Tracker Title',
    student: mockData.profileData.studentProfile._id,
    mentor: mockData.profileData.mentorProfile._id,
    mentorIsSubstitute: false,
    subjects: [],
    communications: [
      { with: 'Student', role: 'student' }, 
      { with: 'Family', role: 'family' }, 
      { with: 'Teacher', role: 'teacher' }, 
      { with: 'Coach', role: 'coach' },
    ],
    oneTeam: {},
    oneTeamNotes: '',
    pointSheetStatus: {},
    pointSheetStatusNotes: '',
    mentorGrantedPlayingTime: 'One quarter',
    synopsisComments: {
      mentorGrantedPlayingTimeComments: faker.lorem.words(3),
      studentActionItems: faker.lorem.words(3),
      sportsUpdate: faker.lorem.words(3),
      additionalComments: faker.lorem.words(3),
    },
  };

  // populate subjects
  const numSubjects = elementaryStudent ? 4 : 7;
  for (let i = 0; i < numSubjects; i++) {
    const newSubject = {
      subjectName: faker.name.firstName(),
      teacher: elementaryStudent ? teachers[0] : teachers[i],
      scoring: {
        excusedDays: randomVal(0, 2),
        stamps: randomVal(0, 10),
        halfStamps: 0,
      },
      grade: elementaryStudent ? '' : randomGrade(),
    };
    newSubject.halfStamps = randomVal(0, 10) - newSubject.stamps;
    if (!elementaryStudent && i === 0) newSubject.subjectName = 'Tutorial';
    mockPointTracker.subjects.push(newSubject);
  }

  let pointTracker;
  try {
    pointTracker = await new PointTracker(mockPointTracker).save();
  } catch (err) {
    console.log(`cptm error on save: ${err}`);
  }
  mockData.mockProfiles = profileData;
  mockData.pointTracker = pointTracker;

  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    removeProfileResources(),
    PointTracker.deleteMany({}),
  ]);
};

export { createPointTrackerMockPromise, removeAllResources };
