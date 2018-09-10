import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { createPointTrackerMockPromise, removeAllResources } from './lib/point-tracker-mock';
import { startServer, stopServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

const cleanDate = (dayAdder) => {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate() + dayAdder;
  const year = dateObj.getUTCFullYear();
  const newDate = `${year}-${month}-${day}`;
  return newDate;
};

// this is more a visual test than an actual functional test. This was written to dump
// populated documents so we could visually verify the were working correctly.

describe('POINT TRACKER DATA EXPORT TESTS', () => {
  let mock;
  let from;
  let to;
  beforeEach(async () => {
    await startServer();
    await removeAllResources();
    await createPointTrackerMockPromise();
    await createPointTrackerMockPromise();
    await createPointTrackerMockPromise();
    await createPointTrackerMockPromise();
    mock = await createPointTrackerMockPromise();
    from = cleanDate(0); 
    to = cleanDate(1);
  });

  afterEach(async () => {
    await stopServer();
  });
  
  test('Get point tracker extract from database', async () => {
    let response;
    try {    
      response = await superagent.get(`${apiUrl}/extract`)
        .authBearer(mock.profileData.adminToken)
        .query({ from, to });
      expect(response.status).toEqual('Request should have failed due to missing/bad google token');
    } catch (err) {
      expect(err.status).toEqual(401);
    }
  });
});
