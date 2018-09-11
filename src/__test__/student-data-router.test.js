import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
import { createStudentDataMockPromise, removeAllResources } from './lib/student-data-mock';
import logger from '../lib/logger';
// import Profile from '../model/profile';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING STUDENT DATA ROUTER', () => {
  let mockData;
  let mockProfiles;

  afterEach(async () => { await stopServer(); });

  beforeEach(async () => {
    await startServer();
    await removeAllResources();
    try {
      mockData = await createStudentDataMockPromise();
      mockProfiles = mockData.profiles;
    } catch (err) {
      logger.log(logger.ERROR, `Unexpected error in student-data-router.test beforeEach: ${err}`);
    }
    return undefined;
  });
  afterEach(async () => {
    await stopServer();
  });

  describe('POST STUDENT DATA ROUTES TESTING', () => {
    test('POST 200 to successfully save student data', async () => {
      const newData = {
        student: mockProfiles.studentProfile._id.toString(),
        lastPointTracker: mockData.pointTracker._id.toString(),
        sports: {
          sportName: 'quidich',
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
  });
});
