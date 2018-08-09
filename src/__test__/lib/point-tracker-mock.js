import faker from 'faker';
import PointTracker from '../../model/point-tracker';
import { createProfileMockPromise, removeAllResources as removeProfileResources } from './profile-mock';

const createPointTrackerMockPromise = async () => {
  const mockData = {};

  const profileData = await createProfileMockPromise();
  mockData.account = profileData.account;
  mockData.profile = profileData.profile;
  mockData.token = profileData.token;
  mockData.originalRequest = profileData.originalRequest;

  const mockPointTracker = {
    date: new Date().now(),
    studentId: mockData.profile._id,
    subjects: [
      {
        subjectName: faker.name.firstName(),
        teacher: faker.name.findName(),
        scoring: {
          excusedDays: 1,
          stamps: 2,
          x: 3,
          tutorials: 2,
        },
      },
      {
        subjectName: faker.name.firstName(),
        teacher: faker.name.findName(),
        scoring: {
          excusedDays: 3,
          stamps: 4,
          x: 1,
          tutorials: 1,
        },
      },
    ],
    surveyQuestions: {
      attendedCheckin: true,
      metFaceToFace: true,
      hadOtherCommunication: false,
      scoreSheetTurnedIn: true,
    },
    synopsisComments: {
      extraPlayingTime: faker.lorem.words(3),
      mentorGrantedPlayingTime: 'one quarter',
      studentActionItems: faker.lorem.words(3),
      sportsUpdate: faker.lorem.words(3),
      additionalComments: faker.lorem.words(3),
    },
  };

  const pointTracker = await new PointTracker(mockPointTracker).save();
  mockData.pointTracker = pointTracker;
  console.log('ppp ppp ppp pointTracker save', JSON.stringify(mockData, null, 2));
  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    removeProfileResources(),
    PointTracker.remove({}),
  ]);
};

export { createPointTrackerMockPromise, removeAllResources };
