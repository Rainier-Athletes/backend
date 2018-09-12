import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { createStudentDataMockPromise, removeAllResources } from './lib/student-data-mock';
import { startServer, stopServer } from '../lib/server';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

// this is more a visual test than an actual functional test. This was written to dump
// populated documents so we could visually verify the were working correctly.

describe('MODEL AUTO POPULATE TESTS', () => {
  let mock;
  beforeEach(async () => {
    await startServer();
    await removeAllResources();
    mock = await createStudentDataMockPromise();
  });

  afterEach(async () => {
    await stopServer();
  });
  
  test('Get point tracker mock from database', async () => {
    let response;
    try {
      response = await superagent.get(`${apiUrl}/pointstracker`)
        .authBearer(mock.profiles.adminToken)
        .query({ id: mock.pointTracker._id.toString() });
    } catch (err) {
      console.error(err);
    }
    expect(response.body).toBeTruthy();
    console.log('POINT TRACKER POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });

  test('Get student profile mock from database', async () => {
    const student = mock.profiles.studentProfile;

    let response;
    try {
      response = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mock.profiles.mentorToken)
        .query({ id: student._id.toString() });
    } catch (err) {
      console.error(err);
    }

    expect(response.body).toBeTruthy();
    console.log('STUDENT PROFILE POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });

  test('Get student data mock from database', async () => {
    let response;
    try {
      response = await superagent.get(`${apiUrl}/studentdata`)
        .authBearer(mock.profiles.adminToken)
        .query({ id: mock.studentData._id.toString() });
    } catch (err) {
      console.error(err);
    }
    expect(response.body).toBeTruthy();
    console.log('STUDENT DATA POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });

  test('Get mentor profile mock from database', async () => {
    const mentor = mock.profiles.mentorProfile;
    mentor.students.push(mock.profiles.studentProfile._id.toString());

    try {
      await superagent.put(`${apiUrl}/profiles`)
        .authBearer(mock.profiles.adminToken)
        .send(mentor);
    } catch (err) {
      console.error(err);
    }

    let response;
    try {
      response = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mock.profiles.adminToken)
        .query({ id: mentor._id.toString() });
    } catch (err) {
      console.error(err);
    }
    
    expect(response.body).toBeTruthy();
    console.log('MENTOR PROFILE POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });
});
