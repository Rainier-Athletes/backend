import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { createPointTrackerMockPromise, removeAllResources } from './lib/point-tracker-mock';
import PointTracker from '../model/point-tracker';
import { startServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING POINT-TRACKER ROUTER', () => {
  beforeAll(async () => { await startServer(); });

  let mockData;
  beforeEach(async () => {
    await removeAllResources();
    mockData = await createPointTrackerMockPromise();
  });

  describe('Testing point-tracker POST route', () => {
    test('POST 200 good request', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      let response;
      try {
        response = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .send(newPT);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good post to point-tracker');
      }
      expect(response.status).toEqual(200);
      expect(response.body.student.toString()).toEqual(mockData.profileData.studentProfile._id.toString());
    });

    test('POST 400 BAD REQUESSSST', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      delete newPT.student;
      let response;
      try {
        response = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .send(newPT);
        expect(response.status).toEqual('this shouldnt get hit mateys');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('POST 401 BAD TOKEN', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      try {
        const response = await superagent.post(`${apiUrl}/pointstracker`) /*eslint-disable-line*/
          .authBearer(mockData.mockProfiles.studentToken)
          .send(newPT);
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 404 BAD ROUTERINO', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      let response;
      try {
        response = await superagent.post(`${apiUrl}/AndrewTodoPeacockCodedThisParticularTestAndShallLiveForeverThroughThisLineOfCode`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .send(newPT);
        expect(response.status).toEqual('this isnt getting hit tho');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('POST 409 conflict', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      let response;
      let dupeResponse; /*eslint-disable-line*/
      try {
        response = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .send(newPT);
        dupeResponse = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .send(newPT);
      } catch (err) {
        expect(err.status).toEqual(409);
      }
      expect(response.status).toEqual(200);
      expect(response.body.student.toString()).toEqual(mockData.profileData.studentProfile._id.toString());
    });
    

  });

  describe('Testing point-tracker GET route', () => {
    test('GET 200 good request', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .query({ id: mockData.pointTracker._id.toString() });
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good get from point-tracker');
      }
      expect(response.status).toEqual(200);
      expect(response.body[0].student.firstName).toEqual(mockData.profileData.studentProfile.firstName);
    });
  });

  describe('Testing point-tracker PUT route', () => {
    test('PUT 200 good request', async () => {
      mockData.pointTracker.synopsisComments.extraPlayingTime = 'This is a change to Extra Play Time comment';
      let response;
      try {
        response = await superagent.put(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .send(mockData.pointTracker);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good put from point-tracker');
      }
      expect(response.status).toEqual(200);
      expect(response.body.synopsisComments.extraPlayingTime).toEqual('This is a change to Extra Play Time comment');
    });
  });

  describe('Testing point-tracker DELETE route', () => {
    test('DELETE 200 good request', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .query({ id: mockData.pointTracker._id.toString() });
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good put from point-tracker');
      }
      expect(response.status).toEqual(200);
      response = await PointTracker.findById(mockData.pointTracker._id);
      expect(response).toBeNull();
    });
  });
});
