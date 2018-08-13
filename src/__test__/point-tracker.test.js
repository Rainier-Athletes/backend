import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { createPointTrackerMockPromise } from './lib/point-tracker-mock';
import { createProfileMockPromise } from './lib/profile-mock';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api`;

describe('PUT POINT-TRACKER TEST', () => {
  test('PUT 200 successful update of points', async () => {
    let pointTracker;
    let profile;

    try {
      let mock = await createProfileMockPromise();
      profile = mock.profile;
    } catch (err) {
      throw err; 
    }
    pointTracker.description = faker.lorem.words(10);
    pointTracker.profile.push(profile._id);
    let response;
    try {
      response = await superagent.put(`${apiUrl}/pointTrackers`)
        .query({ id: pointTracker._id.toString() })
        .authBearer(token)
        .send(pointTracker);
    } catch (err) {
      expect(err).toEqual('POST 200 test should pass');
    }
    expect(response.status).toEqual(200);
    expect(response.body.profileId).toEqual(pointTracker.profile.toString());
    expect(response.body.description).toEqual(pointTracker.description);
    expect(response.body.profiles).toHaveLength();
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

  // test('PUT 200 successful add points to existing profile', async () => {
  //   let pointTracker;
  //   let profile;
    
  //   try {
  //     let mock = await createPointTrackerMockPromise();
  //     pointTracker = mock.pointTracker; /*eslint-disable-line*/
  //     mock = await createPointTrackerMockPromise();
  //     pointTracker = mock.pointTracker; /*eslint-disable-line*/
  //     mock = await createProfileMockPromise();
  //     profile = mock.profile; /*eslint-disable-line*/
  //   } catch (err) {
  //     throw err;
  //   }
  //   pointTracker.profile.push(profile._id);
   

  //   let response;
  //   try {
  //     response = await superagent.put(`${apiUrl}/pointtrackers`)
  //       .query({ id: pointTracker._id.toString() })
  //       .authBearer(token)
  //       .send(pointTracker);
  //   } catch (err) {
  //     expect(err).toEqual('POST 200 test that should pass');
  //   }
  //   expect(response.status).toEqual(200);
  //   expect(response.body.profileId).toEqual(pointTracker.profileId.toString());
  //   expect(response.body.profile).toHaveLength();
    
  // });
});
