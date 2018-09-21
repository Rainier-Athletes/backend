import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { createStudentDataMockPromise, removeAllResources } from './lib/student-data-mock';
import PointTracker from '../model/point-tracker';
import { startServer, stopServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING POINT-TRACKER ROUTER', () => {
  let mockData;
  beforeEach(async () => {
    jest.setTimeout(10000);
    await startServer();
    await removeAllResources();
    mockData = await createStudentDataMockPromise();
    jest.setTimeout(5000);
  });
  afterEach(async () => {
    await stopServer();
  });

  afterEach(async () => { stopServer(); });

  describe('Testing point-tracker POST route', () => {
    test('POST 200 good request, mentor submitting', async () => {
      const newPT = {};
      newPT.title = 'PT ending 2018-09-12';
      newPT.mentorIsSubstitute = false;
      // newPT.mentor = mockData.profileData.mentorProfile._id.toString();
      newPT.student = mockData.profileData.studentProfile._id.toString();
      console.log('newPT:', newPT);
      let response;
      try {
        response = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.mentorToken)
          .send(newPT);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good post to point-tracker');
      }
      expect(response.status).toEqual(200);
      expect(response.body.student.toString()).toEqual(mockData.profileData.studentProfile._id.toString());
      expect(response.body.mentor.toString()).toEqual(mockData.studentData.mentors[0].mentor.toString());
    });

    test('POST 200 good request, substitute (admin) submitting', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      newPT.mentorIsSubstitute = true;
      let response;
      try {
        response = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.adminToken)
          .send(newPT);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good post to point-tracker');
      }
      expect(response.status).toEqual(200);
      expect(response.body.student.toString()).toEqual(mockData.profileData.studentProfile._id.toString());
      expect(response.body.mentor.toString()).toEqual(mockData.profileData.adminProfile._id.toString());
    });

    test('POST 400 BAD REQUEST', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      delete newPT.student; // student is a require property
      let response;
      try {
        response = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.mentorToken)
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
          .authBearer(mockData.profileData.studentToken)
          .send(newPT);
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('POST 404 BAD ROUTER PATH', async () => {
      const newPT = JSON.parse(JSON.stringify(mockData.pointTracker));
      delete newPT._id;
      let response;
      try {
        response = await superagent.post(`${apiUrl}/thisisabadroute`)
          .authBearer(mockData.profileData.mentorToken)
          .send(newPT);
        expect(response.status).toEqual('unexpected success. expecting 404');
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
          .authBearer(mockData.profileData.mentorToken)
          .send(newPT);
        dupeResponse = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.mentorToken)
          .send(newPT);
      } catch (err) {
        expect(err.status).toEqual(409);
      }
      expect(response.status).toEqual(200);
      expect(response.body.student.toString()).toEqual(mockData.profileData.studentProfile._id.toString());
    });

    test('POST 400 bad request: no body', async () => {
      let response;
      try {
        response = await superagent.post(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.adminToken);
        expect(response.status).toEqual('nothing this is supposed to fail');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('Testing point-tracker GET route', () => {
    test('GET 200 good request', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.mentorToken)
          .query({ id: mockData.pointTracker._id.toString() });
        expect(response.status).toEqual(200);
        expect(response.body.student.firstName).toEqual(mockData.profileData.studentProfile.firstName);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good get from point-tracker');
      }
    });

    test('GET 200 on successfull admin retrieval, looking for first save in DB', async () => {
      try {
        const response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.adminToken);
        expect(response.status).toEqual(200);
        expect(response.body[0].student.firstName).toEqual(mockData.profileData.studentProfile.firstName);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
    });

    test('GET 404 not found', async () => {
      const modelMap = {
        id: 123456,
        studentId: 'helloBob',
        title: 'Bobs Point Tracker',
      };
      try {
        const response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.adminToken)
          .query(`id=${modelMap.id}`)
          .query(`studentId=${modelMap.studentId}`)
          .query(`title=${modelMap.title}`);
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
        expect(response.status).toEqual('GET whitelist should have failed with 401');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });


    test('GET 400 Bad request. Non-admin with no query,', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.studentToken)
          .send({});
        expect(response.status).toEqual('unexpected success');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('Testing point-tracker PUT route', () => {
    test('PUT 200 good request', async () => {
      mockData.pointTracker.synopsisComments.mentorGrantedPlayingTimeComments = 'This is a change to Extra Play Time comment';
      let response;
      try {
        response = await superagent.put(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.mentorToken)
          .send(mockData.pointTracker);
      } catch (err) {
        expect(err.status).toEqual('Unexpected error on good put from point-tracker');
      }
      expect(response.status).toEqual(200);
      expect(response.body.synopsisComments.mentorGrantedPlayingTimeComments).toEqual('This is a change to Extra Play Time comment');
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

    test('PUT 404 NOT FOUND', async () => {
      let response;
      const newPt = JSON.parse(JSON.stringify(mockData.pointTracker));
      newPt._id = '12345234590823490182341234';
      try {
        response = await superagent.put(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.adminToken)
          .send(newPt);
        expect(response).toEqual('unexpecte passing, THIS IS ERROR');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('PUT 400 bad request', async () => {
      let response;
      try {
        response = await superagent.put(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.adminToken);
        expect(response.status).toEqual('nothing this is supposed to fail');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('Testing point-tracker DELETE route', () => {
    test('DELETE 200 good request', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/pointstracker`)
          .authBearer(mockData.profileData.mentorToken)
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
          .authBearer(mockData.profileData.adminToken);
        expect(true).toEqual('Missing query');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
