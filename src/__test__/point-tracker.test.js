import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { createPointTrackerMockPromise, removeAllResources } from './lib/point-tracker-mock';

import { startServer, stopServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;
beforeAll(async () => { await startServer(); });
afterAll(stopServer);
beforeEach(removeAllResources);

describe('Adding points to point tracker, POST test', () => {
  test('Testing a posted point tracker', async () => {
    try {
      const response = await superagent.get(`${apiUrl}/fakeroute`);
      expect(response.status).toEqual('404 Bad Route should be returned');
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });

  test('/api/v1/pointstracker 200 POST SUCCESS', async () => {
    const mockPointTracker = await createPointTrackerMockPromise();
    try {
      const response = await superagent.post(`${apiUrl}/pointstracker`)
        .send(mockPointTracker);
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
    } catch (err) {
      expect(err.message).toEqual('Unexpected error while testing point tracker POST');
    }
  });

  test('api/v1/pointstracker 409 DUPLICATE POST', async () => {
    const originalPointTracker = await createPointTrackerMockPromise();
    const duplicatePointTracker = originalPointTracker.originalRequest;
    try {
      const response = await superagent.post(`${apiUrl}/pointstracker`)
        .send(duplicatePointTracker);

      expect(response).toEqual('Unexpected 409 Duplicate');
    } catch (err) {
      expect(err.status).toEqual(409);
    }
  });

  test('api/v1/pointstracker 400 missing information', async () => {
    const mockPointTracker = await createPointTrackerMockPromise();
    mockPointTracker.subjects = null;
    try {
      const response = await superagent.post(`${apiUrl}/pointstracker`)
        .send(mockPointTracker);
      expect(response).toEqual('Unexpected 400 missing subjects');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });
});

describe('Points Tracker information retrieval (GET requests)', () => {
  test('GET 200 to api/v1/pointstracker for successful retrieval of a points tracking sheet', async () => {
    const mockPointTracker = await createPointTrackerMockPromise();
    try {
      const response = await superagent.get(`${apiUrl}/pointstracker`);
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.studentId).toBeDefined();
      expect(response.body.subjects).toEqual(mockPointTracker.subjects);
    } catch (err) {
      expect(err.status).toEqual('Unexpected error response from valid get request');
    }
  });

  test.only('GET 404 for pointstracker not found', async () => {
    const mockData = await createPointTrackerMockPromise();
    try {
      const response = await superagent.get(`${apiUrl}/pointstracker`);
      expect(response).toEqual(`GET POINTS ROUTER: ${mockData.studentId} not found.`);
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });

  test('GET 401 for unauthorized access', async () => {
    try {
      const mockData = await createPointTrackerMockPromise();
      const profile = mockData.profile; /*eslint-disable-line*/
    } catch (err) {
      throw err;
    }
    try {
      const response = await superagent.get(`${apiUrl}/pointstracker`)/*eslint-disable-line*/
        .query({ id: profile.accountId })
        .authBearer('Incorrect token');
      expect(response.status).toEqual('Unreachable code, dont worry about it GET 404');
    } catch (err) {
      expect(err.status).toEqual(401);
    }
  });
});
