import faker from 'faker';
import Profile from '../../model/profile';
import { createAccountMockPromise, removeAccountMockPromise } from './account-mock';

const createProfileMockPromise = async () => {
  const mockData = {};

  const mockAccountData = await createAccountMockPromise();
  mockData.account = mockAccountData.account;
  mockData.originalRequest = mockAccountData.originalRequest;
  mockData.token = mockAccountData.token;
      
  const mockProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'student',
    accountId: mockData.account._id.toString(),
  };

  const profile = await new Profile(mockProfile).save();
  mockData.profile = profile;
  console.log('mmmmmmmmmm mockData', JSON.stringify(mockData, null, 2));
  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    Profile.remove({}),
    removeAccountMockPromise(),
  ]);
};

export { createProfileMockPromise, removeAllResources };
