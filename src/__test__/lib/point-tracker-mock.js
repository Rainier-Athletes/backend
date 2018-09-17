import faker from 'faker';
import PointTracker from '../../model/point-tracker';


import { createProfileMockPromise, removeAllResources as removeProfileResources } from './profile-mock';

const createPointTrackerMockPromise = async () => {
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
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
  teachers.push(await getTeacher());
 
  const mockPointTracker = {
    date: new Date().toISOString(),
    student: mockData.profileData.studentProfile._id,
    mentor: mockData.profileData.mentorProfile._id,
    mentorIsSubstitute: false,
    subjects: [
      {
        subjectName: faker.name.firstName(),
        teacher: teachers[0],
        scoring: {
          excusedDays: 1,
          stamps: 2,
          halfStamp: 3,
          tutorials: 2,
        },
        grade: 70.0,
      },
      {
        subjectName: faker.name.firstName(),
        teacher: teachers[1],
        scoring: {
          excusedDays: 3,
          stamps: 4,
          halfStamp: 1,
          tutorials: 1,
        },
        grade: 90.0,
      },
      {
        subjectName: faker.name.firstName(),
        teacher: teachers[2],
        scoring: {
          excusedDays: 1,
          stamps: 2,
          halfStamp: 3,
          tutorials: 2,
        },
        grade: 70.0,
      },
      {
        subjectName: faker.name.firstName(),
        teacher: teachers[3],
        scoring: {
          excusedDays: 3,
          stamps: 4,
          halfStamp: 1,
          tutorials: 1,
        },
        grade: 90.0,
      },
      {
        subjectName: faker.name.firstName(),
        teacher: teachers[4],
        scoring: {
          excusedDays: 3,
          stamps: 4,
          halfStamp: 1,
          tutorials: 1,
        },
        grade: 90.0,
      },
      {
        subjectName: faker.name.firstName(),
        teacher: teachers[5],
        scoring: {
          excusedDays: 1,
          stamps: 2,
          halfStamp: 3,
          tutorials: 2,
        },
        grade: 70.0,
      },
      {
        subjectName: faker.name.firstName(),
        teacher: teachers[6],
        scoring: {
          excusedDays: 3,
          stamps: 4,
          halfStamp: 1,
          tutorials: 1,
        },
        grade: 90.0,
      },
    ],
    surveyQuestions: {
      mentorAttendedCheckin: true,
      metFaceToFace: true,
      hadOtherCommunication: false,
      hadNoCommunication: false,
      scoreSheetTurnedIn: true,
      scoreSheetLostOrIncomplete: false,
      scoreSheetWillBeLate: false,
      scoreSheetOther: false,
      scoreSheetOtherReason: 'no reason needed in this case',
      synopsisInformationComplete: true,
      synopsisInformationIncomplete: false,
      synopsisCompletedByRaStaff: false,
    },
    synopsisComments: {
      extraPlayingTime: faker.lorem.words(3),
      mentorGrantedPlayingTime: 'one quarter',
      studentActionItems: faker.lorem.words(3),
      sportsUpdate: faker.lorem.words(3),
      additionalComments: faker.lorem.words(3),
    },
  };

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
    PointTracker.remove({}),
  ]);
};

export { createPointTrackerMockPromise, removeAllResources };
