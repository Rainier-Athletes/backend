import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import Account from '../model/account';
import Profile from '../model/profile';

import { startServer, stopServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;
beforeAll(async () => { await startServer(); });
afterAll(stopServer);
beforeEach(async () => {
  await Profile.remove();
  await Account.remove();
});

describe('End-To-End myGarage Test', () => {
  test('End-to-End test in one test otherwise it gets completely messed up', async () => {
    //
    // Create account /api/signup
    //
    const testUsername = faker.internet.userName();
    const testPassword = faker.lorem.words(2);
    const testEmail = faker.internet.email();
    const mockAccount = {
      username: testUsername,
      email: testEmail,
      password: testPassword,
    };
    
    try {
      const response = await superagent.post(`${apiUrl}/signup`)
        .send(mockAccount);
      console.log('test response.status', response.status);
      console.log('test response.body', response.body);
      expect(response.status).toEqual(200);
    } catch (err) {
      expect(err).toEqual('Unexpected error testing good signup.');
    }

    //
    // use new account to log in
    //
    let loginResult;  
    try {
      const response = await superagent.get(`${apiUrl}/login`)
        .auth(testUsername, testPassword); 
      loginResult = response.body;
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.profileId).toBeNull();
    } catch (err) {
      expect(err.status).toEqual('Unexpected error response from valid signIn');
    }
  
    //
    // We're logged in, now create a profile
    //
    const mockProfile = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      role: 'teacher',
    };
    let response;
    try {
      response = await superagent.post(`${apiUrl}/profiles`)
        .authBearer(loginResult.token)
        .send(mockProfile);
    } catch (err) {
      expect(err).toEqual('POST 200 test that should pass');
    }
    expect(response.status).toEqual(200);
    // let profileResult = response.body;

    // 
    // login again and verify that profileId is added to the response
    //
    try {
      response = await superagent.get(`${apiUrl}/login`)
        .auth(testUsername, testPassword); 
      loginResult = response.body;
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.profileId).toBeTruthy();
    } catch (err) {
      expect(err.status).toEqual('Unexpected error response from valid signIn');
    }
  });
});
