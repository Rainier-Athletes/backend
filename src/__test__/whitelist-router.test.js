import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
// import { createAccountMockPromise } from './lib/account-mock';
import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';
import { createWhitelistMockPromise, removeWhitelistResources } from './lib/whitelist-mock';
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING ROUTER WHITELIST', () => {
  let mockData;
  let account;
  let token;
  let mockWhitelist;
  let mockAdminToken;
  let mockMentorToken;
  beforeAll(startServer);
  afterAll(stopServer);
  beforeEach(async () => {
    await removeWhitelistResources();
    try {
      mockWhitelist = await createWhitelistMockPromise();
      mockData = await createProfileMockPromise();
      mockAdminToken = mockData.adminToken;
      mockMentorToken = mockData.mentorToken;
    } catch (err) {
      return logger.log(logger.error, `Unexpected error in whitelist-router beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('POST WHITELIST ROUTES TESTING', () => {
    test('POST 200 to /api/whitelists for successful access', async () => {
      const mockWhitelist1 = { 
        email: faker.internet.email(),
        role: 'admin',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };
      let response;
      try {
        response = await superagent.post(`${apiUrl}/whitelists`)
          .send(mockWhitelist1)
          .authBearer(mockAdminToken);
        expect(response.status).toEqual(200);
        expect(response.body.role).toEqual(mockWhitelist.role);
        expect(response.body.email).toEqual(mockWhitelist.email);
        expect(response.body.firstName).toEqual(mockWhitelist.firstName);
        expect(response.body.lastName).toEqual(mockWhitelist.lastName);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error in POST 200 TEST');
      }
    });
    
    test('POST 401 to /api/whitelists for missing required admin status', async () => {
      const mockWhitelist2 = {
        role: 'mentor',
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };
      try {
        const response = await superagent.post(`${apiUrl}/whitelists`)
          .authBearer(mockMentorToken)
          .send(mockWhitelist2);
        expect(response.status).toEqual('ignored, should not reach this code.');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });
  });

  describe('GET WHITELIST ROUTES TESTING', () => {
    test('GET 200 on successfull whitelist retrieval', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/whitelists`)
          .authBearer(mockAdminToken);
        console.log('get 200 RESPONSE', response.body);
        expect(response.body.role).toEqual(mockWhitelist.role);
      } catch (err) {
        expect(err).toEqual('Failed to get access');
      }
    });
    
    // test('GET 401 WHITELIST UNAUTHORIZED TOKEN', async () => {
    //   let response;
    //   try {
    //     response = await superagent.get(`${apiUrl}/whitelists`)
    //       .authBearer(mockMentorToken);
    //   }
    // })

  //   test('GET 404 PROFILE NOT FOUND THUS WHITELIST NOT FOUND', async () => {
  //     const mock = await createAccountMockPromise();
  //     try {
  //       const response = await superagent.get(`${apiUrl}/whitelists`)
  //         .authBearer(mock.token);
  //       expect(response).toEqual('GET whitelist should have failed with 404');
  //     } catch (err) {
  //       expect(err.status).toEqual(404);
  //     }
  //   });
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
});
