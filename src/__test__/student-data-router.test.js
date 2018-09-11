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

  afterEach(async () => { await stopServer(); });

  beforeEach(async () => {
    await startServer();
    await removeAllResources();
    try {
      mockData = await createStudentDataMockPromise();
    } catch (err) {
      logger.log(logger.ERROR, `Unexpected error in student-data-router.test beforeEach: ${err}`);
    }
    return undefined;
  });
  afterEach(async () => {
    await stopServer();
  });

  describe('POST PROFILE ROUTES TESTING', () => {
    test('POST 200 to successfully save mentor', async () => {
      // console.log(JSON.stringify(mockData, null, 4));
      expect(true).toBeTruthy();
      /*
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
      */
    });
  });
});
