import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
// import { createAccountMockPromise } from './lib/account-mock';
// import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';
import { createWhitelistMockPromise, removeAllResources } from './lib/whitelist-mock';
import logger from '../lib/logger';


bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}`;

describe('TESTING ROUTER WHITELIST', () => {
  let mockData;
  let whitelist;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    await removeAllResources();
    try {
      mockData = await createWhitelistMockPromise();
      whitelist = mockData.whitelist;
    } catch (err) {
      return logger.log(logger.error, `Unexpected error in whitelist-router beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('POST WHITELIST ROUTES TESTING', () => {
    test('POST 200 to /api/whitelists for successful creation', async () => {

    })
    test('POST 400 to /api/whitelists for successful authent')
    test('POST 400 to /api/whitelists for successful authent')
  });

  // describe('GET WHITELIST ROUTES TESTING', () => {
  //   test('GET 200 to /api/whitelists for successful authent')
  //   test('GET 400 to /api/whitelists for successful authent')
  //   test('GET 400 to /api/whitelists for successful authent')
  // });

  // describe('PUT WHITELIST ROUTES TESTING', () => {
  //   test('PUT 200 to /api/whitelists for successful authent')
  //   test('PUT 400 to /api/whitelists for successful authent')
  //   test('PUT 400 to /api/whitelists for successful authent')
  // });

  // describe('DELETE WHITELIST ROUTES TESTING', () => {
  //   test('DELETE 200 to /api/whitelists for successful authent')
  //   test('DELETE 400 to /api/whitelists for successful authent')
  //   test('DELETE 400 to /api/whitelists for successful authent')
  // });
});
