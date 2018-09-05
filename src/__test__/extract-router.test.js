import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { createPointTrackerMockPromise, removeAllResources } from './lib/point-tracker-mock';
import { startServer, stopServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

// this is more a visual test than an actual functional test. This was written to dump
// populated documents so we could visually verify the were working correctly.

describe('POINT TRACKER DATA EXPORT TESTS', () => {
  let mock;
  beforeEach(async () => {
    await startServer();
    await removeAllResources();
    await createPointTrackerMockPromise();
    await createPointTrackerMockPromise();
    await createPointTrackerMockPromise();
    await createPointTrackerMockPromise();
    mock = await createPointTrackerMockPromise();
  });

  afterEach(async () => {
    await stopServer();
  });
  
  test('Get point tracker extract from database', async () => {
    let response;
    try {
      response = await superagent.get(`${apiUrl}/extract`)
        .authBearer(mock.profileData.adminToken)
        .query({ from: '2018-09-01', to: '2018-09-30' });
    } catch (err) {
      console.error(err);
    }
    expect(response.status).toEqual(200);
    // console.log('POINT TRACKER POPULATED');
    // console.log(JSON.stringify(response.body, null, 4));
  });
});
