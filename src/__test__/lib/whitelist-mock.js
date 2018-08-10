import faker from 'faker';
import Whitelist from '../../model/whitelist';
import { removeAllResources } from './profile-mock';

const createWhitelistMockPromise = async () => {
  const mockData = {};

  const mockWhitelist = {
    email: faker.internet.email,
    role: 'admin', 
  };

  const whiteList = await new Whitelist(mockWhitelist).save();
  mockData.whiteList = whiteList;
  console.log('we got dat mockData my folks', JSON.stringify(mockData, null, 2));
  return mockData;
};

const removeWhitelistResources = () => {
  return Promise.all([
    Whitelist.remove({}),
    removeAllResources(),
  ]);
};

export { createWhitelistMockPromise, removeWhitelistResources };
