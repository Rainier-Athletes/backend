import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
// import faker from 'faker';
import { startServer, stopServer } from '../lib/server';
// import { createAccountMockPromise } from './lib/account-mock';
// import { createAttachmentMockPromise } from './lib/attachment-mock';
import { createStudentDataMockPromise, removeAllResources } from './lib/student-data-mock';
import logger from '../lib/logger';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING RELATIONSHIP ROUTER', () => {
  let mockData;

  afterEach(async () => { await stopServer(); });

  beforeEach(async () => {
    await startServer();
    await removeAllResources();
    try {
      mockData = await createStudentDataMockPromise(); 
    } catch (err) {
      return logger.log(logger.ERROR, `Unexpected error in profile-router beforeEach: ${err}`);
    }
    return undefined;
  });
  afterEach(async () => {
    await stopServer();
  });

  describe('GET ATTACH ROUTE TESTING', () => {
    test('GET 200 on successfull attach student to mentor by mentor', async () => {
      let response;
      const testMock = await createStudentDataMockPromise();
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        mentor: testMock.profiles.mentorProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const mentor = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.profiles.adminToken)
        .query({ id: testMock.profiles.mentorProfile._id.toString() });
      expect(mentor.status).toEqual(200);
      expect(mentor.body.students.map(v => v._id.toString()).includes(mockData.profiles.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/studentData`)
        .authBearer(mockData.profiles.adminToken)
        .query({ student: mockData.profiles.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body[0].mentors.map(v => v.mentor._id.toString()).includes(testMock.profiles.mentorProfile._id.toString())).toBeTruthy();
    });

    test('GET 200 on successfull attach student to coach by mentor', async () => {
      let response;
      const testMock = await createStudentDataMockPromise();
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        coach: testMock.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.mentorToken)
          .query(queryParams);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const coach = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.profiles.adminToken)
        .query({ id: testMock.profiles.coachProfile._id.toString() });
      expect(coach.status).toEqual(200);
      expect(coach.body.students.map(v => v._id.toString()).includes(mockData.profiles.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.profiles.adminToken)
        .query({ id: mockData.profiles.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body.studentData.coaches.map(v => v.coach._id.toString()).includes(testMock.profiles.coachProfile._id.toString())).toBeTruthy();
    });
    
    test('GET 200 on successfull attach student to teacher by mentor', async () => {
      let response;
      mockData.profiles.teacherProfile = mockData.profiles.coachProfile;
      mockData.profiles.teacherProfile.role = 'teacher';
      await mockData.profiles.teacherProfile.save();
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        teacher: mockData.profiles.teacherProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.mentorToken)
          .query(queryParams);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const teacher = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.profiles.adminToken)
        .query({ id: mockData.profiles.teacherProfile._id.toString() });
      expect(teacher.status).toEqual(200);
      expect(teacher.body.students.map(v => v._id.toString()).includes(mockData.profiles.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.profiles.adminToken)
        .query({ id: mockData.profiles.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body.studentData.teachers.map(v => v.teacher._id.toString()).includes(mockData.profiles.teacherProfile._id.toString())).toBeTruthy();
    });

    test('GET 200 on successfull attach student to family by admin', async () => {
      let response;
      mockData.profiles.familyProfile = mockData.profiles.coachProfile;
      mockData.profiles.familyProfile.role = 'family';
      await mockData.profiles.familyProfile.save();
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        family: mockData.profiles.familyProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const family = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.profiles.adminToken)
        .query({ id: mockData.profiles.familyProfile._id.toString() });
      expect(family.status).toEqual(200);
      expect(family.body.students.map(v => v._id.toString()).includes(mockData.profiles.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/studentdata`)
        .authBearer(mockData.profiles.adminToken)
        .query({ student: mockData.profiles.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body[0].family.map(v => v.member._id.toString()).includes(mockData.profiles.familyProfile._id.toString())).toBeTruthy();
    });

    test('GET 401 on attempt to attach student to coach by other than mentor or admin', async () => {
      let response;
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        coach: mockData.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.studentToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 401');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('GET 404 on attempt to attach unknown student to coach by mentor or admin', async () => {
      let response;
      const queryParams = {
        student: 'THISISNOTAVALIDID',
        coach: mockData.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 404 on attempt to attach student to unknown coach by mentor or admin', async () => {
      let response;
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        coach: 'THISISNOTAVALIDIDSTRING',
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 400 on bad query: misspelled student id', async () => {
      let response;
      const queryParams = {
        studnt: mockData.profiles.studentProfile._id.toString(),
        coach: mockData.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 400 on bad query: bad support role id', async () => {
      let response;
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        foobar: mockData.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 400 on bad query: no query', async () => {
      let response;
    
      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.profiles.adminToken);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET DETACH ROUTE TESTING', () => {
    test('GET 200 on successful detach of student from coach by admin', async () => {
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        coach: mockData.profiles.coachProfile._id.toString(),
      };

      let response;
      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.status).toEqual('detach should have worked but didn\'t');
      }
    });

    test('GET 200 on successful detach of student from mentor by mentor', async () => {
      mockData.profiles.mentorProfile.students.push(mockData.profiles.studentProfile._id.toString());
      await mockData.profiles.mentorProfile.save();

      let response;
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        mentor: mockData.profiles.mentorProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.mentorToken)
          .query(queryParams);
    
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.status).toEqual('detach should have worked but didn\'t');
      }
    });

    test('GET 401 on authorization error trying detach of student from mentor by coach', async () => {
      let response;
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        mentor: mockData.profiles.mentorProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.coachToken)
          .query(queryParams);
        expect(response.status).toEqual('this should have failed on 401');
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    test('GET 404 on attempt to detach unknown student to coach by mentor or admin', async () => {
      let response;
      const queryParams = {
        student: 'THISISNOTAVALIDID',
        coach: mockData.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 404 on attempt to detach student to unknown coach by mentor or admin', async () => {
      let response;
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        coach: 'THISISNOTAVALIDIDSTRING',
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 400 on bad query: misspelled student id', async () => {
      let response;
      const queryParams = {
        studnt: mockData.profiles.studentProfile._id.toString(),
        coach: mockData.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 400 on bad query: bad support role id', async () => {
      let response;
      const queryParams = {
        student: mockData.profiles.studentProfile._id.toString(),
        foobar: mockData.profiles.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 400 on bad query: no query', async () => {
      let response;
    
      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.profiles.adminToken);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
