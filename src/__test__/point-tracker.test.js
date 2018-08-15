import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createPointTrackerMockPromise, removeAllResources } from './lib/point-tracker-mock';
import { createProfileMockPromise } from './lib/profile-mock';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('PUT POINT TRACKER TEST', () => {
  let mockData;
  let token;
  let account;
  beforeAll(async () => { await startServer(); });
  afterAll(stopServer);
 

  test.only('200 update point tracker', async () => {
    createProfileMockPromise();

    let response;
    try {
      response = await superagent.put(`${apiUrl}/pointstracker`)
        .authBearer(mockData.token)
        .send({ id: mockData.adminProfile._id.toString() });
    } catch (err) {
      expect(err).toEqual('Unexpected error returned on valid udpate');
    }
    expect(response.status).toEqual(200);
  });

  test('PUT 404 Profile not found', async () => {
    const adminprofile = await createProfileMockPromise();
    try {
      const response = await superagent.put(`${apiUrl}/pointTrackers`)
        .query({ id: adminprofile._id })
        .authBearer(token)
        .send(adminprofile);
      expect(response).toEqual('PUT should have returned 404...');
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });


  test('PUT 400 on point tracker not found', async () => {
    const mock = await createPointTrackerMockPromise();
      
    try {
      await superagent.put(`${apiUrl}/pointTrackers`)
        .query({ id: adminProfile._id })
        .authBearer(mock.token)
        .send(adminProfile);
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });
});

describe('DELETE POINT TRACKER TEST', () => {
  let token;

  test('DELETE 200 success', async () => {
    const mock = await createProfileMockPromise();
    const profile = mock.profile; /*eslint-disable-line*/
    let response;
    try {
      response = superagent.delete(`${apiUrl}/profiles`)
        .query({ id: adminProfile._id.toString() })
        .authBearer(mock.token);
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('Unexpected error on valid delete test');
    }
  });

  test('DELETE 404 not found', async () => {
    let response;
    try {
      response = await superagent.delete(`${apiUrl}/profiles`)
        .query({ id: adminProfile._id.toString() })
        .authBearer(token);
      expect(response).toEqual('DELETE 404 expected but not recieved');
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });
  test('DELETE 400 bad request: missing profile', async () => {
    const mock = await createProfileMockPromise();
    try {
      await superagent.delete(`${apiUrl}/profiles`)
        .authBearer(mock.token)
        .query({ id: adminProfile._id.toString() });
      expect(true).toEqual('DELETE 400 missing profile unexpected success');
    } catch (err) {
      expect(err.status).toEqual(400);
    }
  });
});
