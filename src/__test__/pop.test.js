import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { createPointTrackerMockPromise, removeAllResources } from './lib/point-tracker-mock';
import { startServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('POINT TRACKER AUTO POPULATE TESTS', () => {
  beforeAll(startServer);
  let mock;
  beforeEach(async () => {
    await removeAllResources();
    mock = await createPointTrackerMockPromise();
  });
  
  test('Get point tracker mock from database', async () => {
    let response;
    try {
      response = await superagent.get(`${apiUrl}/pointstracker`)
        .authBearer(mock.profileData.adminToken)
        .query({ id: mock.pointTracker._id.toString() });
    } catch (err) {
      console.error(err);
    }
    expect(response.body).toBeTruthy();
    console.log(JSON.stringify(response.body, null, 4));
  });
});
