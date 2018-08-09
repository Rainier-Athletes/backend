import faker from 'faker';
import WhiteList from '../../model/whitelist';
import { removeAllResources } from './profile-mock';

const createWhiteListMockPromise = async () => {
  const mockData = {};

  const mockWhiteList = {
    email: faker.internet.email,
    role: 'admin', 
  };

  const whiteList = await new WhiteList(mockWhiteList).save();
  mockData.whiteList = whiteList;
  console.log('we got dat mockData my folks', JSON.stringify(mockData, null, 2));
  return mockData;
};

const removeWhiteListResources = () => {
  return Promise.all([
    WhiteList.remove({}),
    removeAllResources(),
  ]);
};

export { createWhiteListMockPromise, removeWhiteListResources };
