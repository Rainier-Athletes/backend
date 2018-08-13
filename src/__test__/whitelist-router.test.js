import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
// import { createAccountMockPromise } from './lib/account-mock';
import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';
import { createWhitelistMockPromise, removeWhitelistResources } from './lib/whitelist-mock';
import logger from '../lib/logger';
import { createAccountMockPromise } from './lib/account-mock';

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
      const Whitelist = await createWhitelistMockPromise();
      let response;
      try {
        response = await superagent.post(`${apiUrl}/whitelists`)
          .send(Whitelist)
          .authBearer(mockAdminToken);
        expect(response.status).toEqual(200);
        expect(response.body.role).toEqual(Whitelist.role);
        expect(response.body.email).toEqual(Whitelist.email);
        expect(response.body.firstName).toEqual(Whitelist.firstName);
        expect(response.body.lastName).toEqual(Whitelist.lastName);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error in POST 200 TEST');
      }
    });

    test('POST 404 to /api/whitelists for missing login info', async () => {
      const mock = await createWhitelistMockPromise();
      try {
        const response = await superagent.post(`${apiUrl}/whitelists`)
          .authBearer(mock.token);
        expect(response).toEqual('POST login info needed');
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

    test('GET 401 UNAUTHORIZED TOKEN', async () => {
      const mock = await createWhitelistMockPromise();
      try {
        const response = await superagent.get(`${apiUrl}/whitelists`)
          .authBearer(mock.token);
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
      const mock = await createWhitelistMockPromise();
      try {
        await superagent.put(`${apiUrl}/whitelists`)
          .authBearer(mock.token)
          .send({});
      } catch (err) {
        expect(err.status).toEqual(400);
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
