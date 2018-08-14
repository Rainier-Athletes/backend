import faker from 'faker';
import Profile from '../../model/profile';
import { removeAllResources } from './profile-mock';

const createMentorMockPromise = async () => {
  const mockData = {};

  const mockMentorData = {
    students: ['2123412341234', '123412341234123'],
  };

  const mentor = await new Profile(mockMentorData).save();
  mockData.mentor = mentor;
  console.log('mockdata for mentorino has been createrino', JSON.stringify(mockData, null, 2));
  return mockData;
};

const removeMentorResources = () => {
  return Promise.all([
    Profile.remove({}),
    removeAllResources(),
  ]);
};

export { createMentorMockPromise, removeMentorResources };
