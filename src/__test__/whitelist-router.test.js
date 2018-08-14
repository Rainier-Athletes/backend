import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';

import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';
import { createWhitelistMockPromise, removeWhitelistResources } from './lib/whitelist-mock';
import logger from '../lib/logger';
// import { createAccountMockPromise } from './lib/account-mock';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING ROUTER WHITELIST', () => {
  let mockData;
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
      let response;
      try {
        const mockWhitelist1 = {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          role: 'admin', 
        };
        
        response = await superagent.post(`${apiUrl}/whitelists`)
          .send(mockWhitelist1)
          .authBearer(mockAdminToken);
        expect(response.status).toEqual(200);
        expect(response.body.role).toEqual(mockWhitelist1.role);
        expect(response.body.email).toEqual(mockWhitelist1.email);
        expect(response.body.firstName).toEqual(mockWhitelist1.firstName);
        expect(response.body.lastName).toEqual(mockWhitelist1.lastName);
      } catch (err) {
        expect(err.status).toEqual('not supposed to hit this');
      }
    });

    test('POST 404 on profile not found', async () => {
      const mock = await createProfileMockPromise();
      try {
        const response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(mockAdminToken);
        expect(response).toEqual('POST profile should have failed with 404');
      } catch (err) {
        expect(err.status).toEqual(404);
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

  describe.only('GET WHITELIST ROUTES TESTING', () => {
    test.only('GET 200 on successfull whitelist retrieval', async () => {
      const mockWhitelist = await createWhitelistMockPromise();
      let response;
      console.log(response, 'EHHHHHLLEOOOOOOO')
      try {
        response = await superagent.get(`${apiUrl}/whitelists`)
          .authBearer(mockAdminToken)
          .send(mockWhitelist);
        expect(response.body.firstName).toEqual(mockWhitelist.firstName);
        expect(response.body.lastName).toEqual(mockData.adminProfile);
        expect(response.body.email).toEqual(mockData.adminProfile);
        expect(response.body.role).toEqual(mockData.adminProfile);
      } catch (err) {
        console.log(err, 'DO YOU SEE THIS');
        expect(err.status).toEqual('Failed to get access');
      }
    });

    test('GET 401 UNAUTHORIZED TOKEN', async () => {
      const mock = await createProfileMockPromise();
      try {
        const response = await superagent.get(`${apiUrl}/whitelists`)
          .authBearer(mock.coachToken);
        expect(response).toEqual('GET whitelist should have failed with 404');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });
  });

  describe('PUT WHITELIST ROUTE TESTING', () => {
    test('PUT 200 successful update of existing whitelist', async () => {
      const mock = await createWhitelistMockPromise();
      let response;
      try {
        response = await superagent.put(`${apiUrl}/whitelists`)
          .authBearer(mock.token)
          .send({ email: 'thisis@updated.email' });
        expect(response.status).toEqual(200);
        expect(response.body.accountId).toEqual(mock.profile.accountId.toString());
        expect(response.body.email).toEqual('thisis@updated.email');
      } catch (err) {
        expect(err).toEqual('PUT 200 test that should pass');
      }
    });

    test('PUT 401 NO ADMIN ROLE, DENIED ACCESS', async () => {
      let whitelists;
      try {
        const mock = await createProfileMockPromise();
        whitelists = mock.profile;
      } catch (err) {
        throw err;
      }
      let response;
      try {
        response = await superagent.put(`${apiUrl}/whitelists`)
          .query({ id: whitelists.accoutId })
          .authBearer('admin token missing');
        expect(response.status).toEqual('should not hit here');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('PUT 400 to /api/whitelists bad request, missing request', async () => {
      const mock = await createProfileMockPromise();
      try {
        await superagent.put(`${apiUrl}/whitelists`)
          .authBearer(mockAdminToken)
          .send({});
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 404 whitelist not found', async () => {
      const mock = await createWhitelistMockPromise();

      const profile = await createProfileMockPromise();
      try {
        const response = await superagent.put(`${apiUrl}/whitelists`)
          .authBearer(mock.token)
          .send(profile);
        expect(response).toEqual('PUT if you see this, this test failed');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
  });

  describe('DELETE WHITELIST ROUTES TESTING', () => {
    test('DELETE 200 to /api/whitelists for successful authent', async () => {
      const mock = await createWhitelistMockPromise();
      const whitelist = mock.whitelist; // eslint-disable-line
      let response; 
      try {
        response = await superagent.delete(`${apiUrl}/whitelists`)
          .query({ id: whitelist._id.toString() })
          .authBearer(mock.token);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err).toEqual('unexpected error  on valid delete test');
      }
    });

    test('DELETE 404 not found', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/whitelists`)
          .query({ id: '1234568909876543321' })
          .authBearer(token);
        expect(response).toEqual('DELETE 404 expected but not received');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('DELETE 401 bad token', async () => {
      try {
        await superagent.delete(`${apiUrl}/whitelists`)
          .query({ id: 'badID' })
          .authBearer('badtoken');
        expect(true).toEqual('DELETE 401 expected but succeeded');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });
  });
});
