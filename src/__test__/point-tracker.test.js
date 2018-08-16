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
    test('GET 200 good request using id query', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.mentorToken)
          .query({ id: mockData.pointTracker._id.toString() });
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good get from point-tracker');
      }
      expect(response.status).toEqual(200);
      expect(response.body.student.firstName).toEqual(mockData.profileData.studentProfile.firstName);
    });

    test('GET 404 bad request', async () => {
      const modelMap = {
        id: 123456,
        studentId: 'helloBob',
        date: Date.now(),
      };
      try {
        const response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.adminToken)
          .query('id=1234')
          .query('studentId=hello')
          .query(`date=${modelMap.date}`);
        expect(response.status).toEqual('nothing to pass, should FAIL');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 401 no access, not logged in', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer();
        expect(response).toEqual('GET whitelist should have failed with 401');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('GET 200 retrieve all trackers as admin', async () => {
      let response; 
      try {
        response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.adminToken)
          .query({});
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.status).toEqual('Unexpected failure admin get all points trackers.');
      }
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

  test('Get populated then Put test', async () => {
    let response;
    try {
      response = await superagent.get(`${apiUrl}/pointstracker`)
        .authBearer(mockData.profileData.adminToken)
        .query({ id: mockData.pointTracker._id.toString() });
    } catch (err) {
      console.error(err);
    }
    expect(response.body).toBeTruthy();
    response.body.subjects[1].subjectName = 'New Subject Name';
    let putResponse;
    try {
      putResponse = await superagent.put(`${apiUrl}/pointstracker`)
        .authBearer(mockData.profileData.adminToken)
        .send(response.body);
    } catch (err) {
      console.error(err);
    }
    expect(putResponse.status).toEqual(200);
    expect(putResponse.body.subjects[1].subjectName).toEqual('New Subject Name');
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

    test('DELETE 400 bad query', async () => {
      try {
        await superagent.delete(`${apiUrl}/pointstracker`)
          .authBearer(mockData.mockProfiles.adminToken);
        expect(true).toEqual('Missing query');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
