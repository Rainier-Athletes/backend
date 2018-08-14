import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { createPointTrackerMockPromise } from './lib/point-tracker-mock';
import { createProfileMockPromise } from './lib/profile-mock';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;
beforeAll(async () => { await startServer(); });
afterAll(stopServer);
beforeEach(removePointTrackerMockPromise);

describe('PUT POINT TRACKER TEST', () => {
  test.only('200 update point tracker', async () => {
    const mockData = await createAccountMockPromise();

    let response;
    try {
      response = await superagent.put(`${apiUrl}/profile`)
        .authBearer(mockData.token)
        .send({ id: profile._id.toString() });
    } catch (err) {
      expect(err).toEqual('Unexpected error returned on valid udpate');
    }
    expect(response.status).toEqual(200);
  });

  describe('PUT POINT TRACKER TEST', () => {
    test('PUT 200 successful update of points', async () => {
      const mockData = await createPointTrackerMockPromise();
      
      let response;
      try {
        response = await superagent.put(`${apiUrl}/profile`)
          .authBearer(mockData.token)
          .send({ id: profile._id.toString() });
      } catch (err) {
        expect(err).toEqual('Unexpected error');
      }
      expect(response.status).toEqual(200); 
    });

    test('PUT 404 Profile not found', async () => {
      let response;
      const profile = await createProfileMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/pointTrackers`)
          .query({ id: profile._id })
          .authBearer(token)
          .send(profile);
        expect(response).toEqual('PUT should have returned 404...');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });


    test('PUT 400 on point tracker not found', async () => {
      const mock = await createPointTrackerPromise();
      let response;
      const profile = await createProfileMockPromise();
      try {
        response = await superagent.put(`${apiUrl}/pointTrackers`)
          .query({ id: profile._id })
          .authBearer(mock.token)
          .send(profile);
        expect(response).toEqual('PUT should have returned 400...');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('DELETE POINT TRACKER TEST', () => {
    test('DELETE 200 success', async () => {
      const mock = await createProfileMockPromise();
    profile = mock.profile; /*eslint-disable-line*/

      try {
        response = superagent.delete(`${apiUrl}/profiles`)
          .query({ id: profile._id.toString() })
          .authBearer(token);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err).toEqual('Unexpected error on valid delete test');
      }
    });

    test('DELETE 404 not found', async () => {
      try {
        response = await superagent.delete(`${apiUrl}/profiles`)
          .query({ id: profile._id.toString() })
          .authBearer(token);
        expect(response).toEqual('DELETE 404 expected but not recieved');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
    test('DELETE 400 bad request: missing profile', async () => {
      const mock = await createAccountMockPromise();
      try {
        await superagent.delete(`${apiUrl}/garages`)
          .authBearer(mock.token)
          .query({ id: profile._id.toString() });
        expect(true).toEqual('DELETE 400 missing profile unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
