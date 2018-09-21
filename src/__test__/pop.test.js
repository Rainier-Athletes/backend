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
  let mockElementary;
  beforeEach(async () => {
    await startServer();
    await removeAllResources();
    mock = await createStudentDataMockPromise();
    mockElementary = await createStudentDataMockPromise(true);
  });

  afterEach(async () => {
    await stopServer();
  });
  
  test('Get MS point tracker mock from database', async () => {
    let response;
    try {
      response = await superagent.get(`${apiUrl}/pointstracker`)
        .authBearer(mock.profileData.adminToken)
        .query({ id: mock.pointTracker._id.toString() });
    } catch (err) {
      console.error(err);
    }
    expect(response.body).toBeTruthy();
    console.log('MIDDLE SCHOOL POINT TRACKER POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });

  test('Get ES point tracker mock from database', async () => {
    let response;
    try {
      response = await superagent.get(`${apiUrl}/pointstracker`)
        .authBearer(mockElementary.profileData.adminToken)
        .query({ id: mockElementary.pointTracker._id.toString() });
    } catch (err) {
      console.error(err);
    }
    expect(response.body).toBeTruthy();
    console.log('ELEMENTARY SCHOOL POINT TRACKER POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });

  test('Get student profile mock from database', async () => {
    const student = mock.profileData.studentProfile;

    let response;
    try {
      response = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mock.profileData.mentorToken)
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
        .authBearer(mock.profileData.adminToken)
        .query({ id: mock.studentData._id.toString() });
    } catch (err) {
      console.error(err);
    }
    expect(response.body).toBeTruthy();
    console.log('STUDENT DATA POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });

  test('Get mentor profile mock from database', async () => {
    const mentor = mock.profileData.mentorProfile;
    mentor.students.push(mock.profileData.studentProfile._id.toString());

    try {
      await superagent.put(`${apiUrl}/profiles`)
        .authBearer(mock.profileData.adminToken)
        .send(mentor);
    } catch (err) {
      console.error(err);
    }

    let response;
    try {
      response = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mock.profileData.adminToken)
        .query({ id: mentor._id.toString() });
    } catch (err) {
      console.error(err);
    }
    
    expect(response.body).toBeTruthy();
    console.log('MENTOR PROFILE POPULATED');
    console.log(JSON.stringify(response.body, null, 4));
  });
});
