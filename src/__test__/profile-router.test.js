import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer } from '../lib/server';
import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';
import logger from '../lib/logger';
// import Profile from '../model/profile';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING ROUTER PROFILE', () => {
  let mockData;
  beforeAll(startServer);
  // afterAll(stopServer);
  beforeEach(async () => {
    await removeAllResources();
    try {
      mockData = await createProfileMockPromise();
    } catch (err) {
      return logger.log(logger.ERROR, `Unexpected error in profile-router.test beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('POST PROFILE ROUTES TESTING', () => {
    test('POST 200 to successfully save mentor', async () => {
      console.log('mockData: ', JSON.stringify(mockData, null, 4));
      const mockProfile = {
        role: 'mentor',
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };
      let response;
      try {
        response = await superagent.post(`${apiUrl}/profiles`)
          .authBearer(mockData.adminToken)
          .send(mockProfile);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.firstName).toEqual(mockProfile.firstName);
      expect(response.body.lastName).toEqual(mockProfile.lastName);
      expect(response.body.email).toEqual(mockProfile.email);
      expect(response.body.role).toEqual(mockProfile.role);
    });

    test('POST 400 for trying to post a profile with a bad token', async () => {
      try {
        const response = await superagent.post(`${apiUrl}/profiles`)
          .set('Authorization', 'Bearer THISABADTOKEN');
        expect(response).toEqual('POST 400 in try block. Shouldn\'t be executed.');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 400 to /api/v1/profiles for missing required firstName', async () => {
      const mockProfile = {
        role: 'mentor',
        email: faker.internet.email(),
        // firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      };
      try {
        const response = await superagent.post(`${apiUrl}/profiles`)
          .authBearer(mockData.adminToken)
          .send(mockProfile);
        expect(response.status).toEqual('ignored, should not reach this code.');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET PROFILES ROUTE TESTING', () => {
    test('GET 200 on successfull profile retrieval by student', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(mockData.studentToken);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      expect(response.body.firstName).toEqual(mockData.studentProfile.firstName);
    });

    test('GET 200 on successfull admin profile/me retrieval', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles/me`)
          .authBearer(mockData.adminToken);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body.firstName).toEqual(mockData.adminProfile.firstName);
    });

    test('GET 200 on successfull admin retrieval of all profiles', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(mockData.adminToken);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(5);
    });

    test('GET 200 on successful admin search of mentor role', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?role=mentor`)
          .authBearer(mockData.adminToken);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(1);
    });

    test('GET 200 on successful admin search of student role', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?role=student`)
          .authBearer(mockData.adminToken);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(1);
    });

    test('GET 200 on successful admin search of coach role', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?role=coach`)
          .authBearer(mockData.adminToken);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(1);
    });

    test('GET 200 on successful admin search for skyline high school', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?school=skyline%20high%20school`)
          .authBearer(mockData.adminToken);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(1);
    });

    test('GET 200 on successful admin search for active profiles', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?active=true`)
          .authBearer(mockData.adminToken);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(5);
    });

    test('GET 200 on successful admin search for male profiles', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?gender=male`)
          .authBearer(mockData.adminToken);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(2);
    });

    test('GET 200 on successful admin search for female profiles', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?gender=female`)
          .authBearer(mockData.adminToken);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(2);
    });

    test('GET 200 on successful admin search for female mentors', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?gender=female&role=mentor`)
          .authBearer(mockData.adminToken);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(1);
    });

    test('GET 200 on successful admin search for all active males', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles?active=true&gender=male`)
          .authBearer(mockData.adminToken);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body).toHaveLength(2);
    });

    test('GET 200 on successfull retrieval of profile by id', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer(mockData.adminToken)
          .query({ id: mockData.coachProfile._id.toString() });
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.body.firstName).toEqual(mockData.coachProfile.firstName);
    });

    test('GET 404 on profile not found', async () => {
      await removeAllResources();
      try {
        const response = await superagent.get(`${apiUrl}/profiles`)/*eslint-disable-line*/
          .authBearer(mockData.mentorToken);
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 401 on bad token', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/profiles`)
          .authBearer('this is not the token we seek');
        expect(response.status).toEqual('We should not reach this code GET 401');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });
  });

  describe('PUT PROFILES ROUTE TESTING', () => {
    test('PUT 200 successful update of existing profile', async () => {
      let response;
      // now change one property of the profile and update it.
      mockData.profile.email = 'thisis@updated.email';
      try {
        response = await superagent.put(`${apiUrl}/profiles`)
          .authBearer(mockData.adminToken)
          .send(mockData.profile);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }
      expect(response.status).toEqual(200);
      expect(response.body.email).toEqual('thisis@updated.email');
    });

    test('PUT 400  update of existing profile without body', async () => {
      try {
        await superagent.put(`${apiUrl}/profiles`)
          .authBearer(mockData.token)
          .send({});
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('PUT 404 profile not found', async () => {
      await mockData.profile.remove();
      try {
        const response = await superagent.put(`${apiUrl}/profiles`)
          .authBearer(mockData.token)
          .send(mockData.profile);
        expect(response).toEqual('PUT should have returned 404...');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('PUT 400 bad request', async () => {
      let response;
      try {
        response = await superagent.put(`${apiUrl}/profiles`);
        expect(response).toEqual('We should have failed with a 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('DELETE PROFILE ROUTE TESTING', () => {
    test('DELETE 200 success', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: mockData.studentProfile._id.toString() })
          .authBearer(mockData.adminToken);
      } catch (err) {
        expect(err).toEqual('Unexpected error on valid delete test');
      }
      expect(response.status).toEqual(200);
    });

    test('DELETE 404 not found', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: '1234568909876543321' })
          .authBearer(mockData.adminToken);
        expect(response).toEqual('DELETE 404 expected but not received');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('DELETE 400 bad request. missing query.', async () => {
      try {
        await superagent.delete(`${apiUrl}/profiles`)
          .authBearer(mockData.adminToken);
        expect(true).toEqual('DELETE 400 missing query unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('DELETE 401 unauthorized token', async () => {
      try {
        await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: mockData.mentorProfile._id.toString() })
          .authBearer(mockData.studentToken);
        expect(true).toEqual('DELETE 401 expected but succeeded');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('DELETE 400 missing token', async () => {
      try {
        await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: 'thiswontbereached' });
        expect(true).toEqual('DELETE 400 expected but succeeded');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
