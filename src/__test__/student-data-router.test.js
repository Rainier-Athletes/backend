import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';

import { startServer, stopServer } from '../lib/server';
import { createStudentDataMockPromise, removeAllResources } from './lib/student-data-mock';
import logger from '../lib/logger';
// import Profile from '../model/profile';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING STUDENT DATA ROUTER', () => {
  let mockData;
  let mockProfiles;

  beforeEach(async () => {
    jest.setTimeout(20000);
    await startServer();
    await removeAllResources();
    try {
      mockData = await createStudentDataMockPromise();
      await createStudentDataMockPromise(true); // create an elementary student for use by FE
      mockProfiles = mockData.profileData;
    } catch (err) {
      logger.log(logger.ERROR, `Unexpected error in student-data-router.test beforeEach: ${err}`);
    }
    jest.setTimeout(5000);
    return undefined;
  });

  afterEach(async () => {
    await stopServer();
  });

  describe('POST STUDENT DATA TESTING', () => {
    // test.only('dummy test', () => {
    //   expect(true).toBeTruthy();
    // });

    test('POST 200 to successfully save student data', async () => {
      const newData = {
        student: mockProfiles.studentProfile._id.toString(),
        lastPointTracker: mockData.pointTracker._id.toString(),
        sports: {
          sport: 'quidich',
        },
      };

      let response;
      try {
        response = await superagent.post(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken)
          .send(newData);
      } catch (err) {
        expect(err).toEqual('POST 200 test that should pass');
      }

      expect(response.status).toEqual(200);
      expect(response.body.student.toString()).toEqual(mockProfiles.studentProfile._id.toString());

      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockProfiles.adminToken)
        .query({ id: newData.student });
      expect(student.status).toEqual(200);
      expect(student.body.studentData._id.toString()).toEqual(response.body._id.toString());
    });

    test('POST 400 bad request', async () => {
      let response;
      try {
        response = await superagent.post(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken);
        // missing body
        expect(response.status).toEqual('Test should have failed with 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET STUDENT DATA TESTING', () => {
    test('GET 200 to successfully retrieve student data by studentData id', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken)
          .query({ id: mockData.studentData._id.toString() });
      } catch (err) {
        expect(err).toEqual('Get of mock data should have worked');
      }
      expect(response.status).toEqual(200);
      expect(response.body[0].sports[0].sport).toEqual(mockData.studentData.sports[0].sport);
    });

    test('GET 200 to successfully retrieve student data by studentData student id', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken)
          .query({ student: mockProfiles.studentProfile._id.toString() });
      } catch (err) {
        expect(err).toEqual('Get of mock data should have worked');
      }
      expect(response.status).toEqual(200);
      expect(response.body[0].sports[0].sport).toEqual(mockData.studentData.sports[0].sport);
    });

    test('GET 400 missing query string', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken);
        expect(response.status).toEqual('GET should have failed');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 404 to retrieve nonexistant student data', async () => {
      let response;
      try {
        response = await superagent.get(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken)
          .query({ id: 'THISISNOTANOBJECTID' });
        expect(response.status).toEqual('GET should have failed');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
  });

  describe('PUT STUDENT DATA TESTING', () => {
    test('PUT 200 valid update to student data', async () => {
      expect(mockData.studentData.grade).toEqual(7);
      mockData.studentData.grade = 8;
      let response;
      try {
        response = await superagent.put(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken)
          .send(mockData.studentData);
      } catch (err) {
        expect(err).toEqual('Put of mock data should have worked');
      }
      expect(response.status).toEqual(200);
      expect(response.body.grade).toEqual(8);
    });

    test('PUT 400 bad request', async () => {
      let response;
      try {
        response = await superagent.put(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken);
        // missing body
        expect(response.status).toEqual('Test should have failed with 400');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('DELETE STUDENT DATA TESTING', () => {
    test('DELETE 200 good request', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken)
          .query({ id: mockData.studentData._id.toString() });
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.status).toEqual('Delete should ahve worked');
      }
    });

    test('DELETE 400 bad request', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken);
        expect(response.status).toEqual('Delete should have failed');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('DELETE 404 unrecognized id', async () => {
      let response;
      try {
        response = await superagent.delete(`${apiUrl}/studentdata`)
          .authBearer(mockProfiles.adminToken)
          .query({ id: 'THISISNOTANIDSTRING' });
        expect(response.status).toEqual('Delete should have failed');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });
  });
});
