import faker from 'faker';
import Profile from '../../model/profile';
import { createAccountMockPromise, removeAccountMockPromise } from './account-mock';

const createProfileMockPromise = async () => {
  const mockData = {};

  const mockAccountData = await createAccountMockPromise();
  mockData.account = mockAccountData.account;
  mockData.originalRequest = mockAccountData.originalRequest;
  mockData.token = mockAccountData.token;

  const mockMentorData = await createAccountMockPromise();
  mockData.mentorAccount = mockMentorData.account;
  mockData.mentorOriginalRequest = mockMentorData.originalRequest;
  mockData.mentorToken = mockMentorData.token;

  const mockAdminData = await createAccountMockPromise();
  mockData.adminAccount = mockAdminData.account;
  mockData.adminOriginalRequest = mockAdminData.originalRequest;
  mockData.adminToken = mockAdminData.token;
      
  const mockProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'student',
    accountId: mockData.account._id.toString(),
  };

  const mockMentorProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'mentor',
    accountId: mockData.mentorAccount._id.toString(),
  };

  const mockAdminProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'admin',
    accountId: mockData.adminAccount._id.toString(),
  };
  const profile = await new Profile(mockProfile).save();
  const mentor = await new Profile(mockMentorProfile).save();
  const admin = await new Profile(mockAdminProfile).save();

  mockData.mentorProfile = mentor;
  mockData.adminProfile = admin;
  mockData.profile = profile;
  return mockData;
};

const removeAllResources = () => {
  return Promise.all([
    Profile.remove({}),
    removeAccountMockPromise(),
  ]);
};

export { createProfileMockPromise, removeAllResources };
