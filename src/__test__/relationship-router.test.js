import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
// import faker from 'faker';
import { startServer } from '../lib/server';
// import { createAccountMockPromise } from './lib/account-mock';
// import { createAttachmentMockPromise } from './lib/attachment-mock';
import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';
import logger from '../lib/logger';
import Profile from '../model/profile';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;

describe('TESTING RELATIONSHIP ROUTER', () => {
  let mockData;

  beforeAll(startServer);
  // afterAll(stopServer);
  beforeEach(async () => {
    await removeAllResources();
    try {
      mockData = await createProfileMockPromise(); 
    } catch (err) {
      return logger.log(logger.ERROR, `Unexpected error in profile-router beforeEach: ${err}`);
    }
    return undefined;
  });

  describe('GET ATTACH ROUTE TESTING', () => {
    test('GET 200 on successfull attach student to mentor by mentor', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        mentor: mockData.mentorProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.mentorToken)
          .query(queryParams);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const mentor = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.mentorProfile._id.toString() });
      expect(mentor.status).toEqual(200);
      expect(mentor.body.students.map(v => v._id.toString()).includes(mockData.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body.studentData.mentor._id.toString()).toEqual(mockData.mentorProfile._id.toString());
    });

    test('GET 200 on successfull attach student to coach by mentor', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        coach: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.mentorToken)
          .query(queryParams);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const coach = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.coachProfile._id.toString() });
      expect(coach.status).toEqual(200);
      expect(coach.body.students.map(v => v._id.toString()).includes(mockData.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body.studentData.coaches.map(v => v._id.toString()).includes(mockData.coachProfile._id.toString())).toBeTruthy();
    });
    
    test('GET 200 on successfull attach student to teacher by mentor', async () => {
      let response;
      mockData.teacherProfile = mockData.coachProfile;
      mockData.teacherProfile.role = 'teacher';
      await mockData.teacherProfile.save();
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        teacher: mockData.teacherProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.mentorToken)
          .query(queryParams);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const teacher = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.teacherProfile._id.toString() });
      expect(teacher.status).toEqual(200);
      expect(teacher.body.students.map(v => v._id.toString()).includes(mockData.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body.studentData.teachers.map(v => v._id.toString()).includes(mockData.teacherProfile._id.toString())).toBeTruthy();
    });

    test('GET 200 on successfull attach student to family by admin', async () => {
      let response;
      mockData.familyProfile = mockData.coachProfile;
      mockData.familyProfile.role = 'family';
      await mockData.familyProfile.save();
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        family: mockData.familyProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const family = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.familyProfile._id.toString() });
      expect(family.status).toEqual(200);
      expect(family.body.students.map(v => v._id.toString()).includes(mockData.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body.studentData.family.map(v => v._id.toString()).includes(mockData.familyProfile._id.toString())).toBeTruthy();
    });

    test('GET 200 on successfull attach student to coach by admin', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        coach: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        // profileResult = response.body;
      } catch (err) {
        expect(err).toEqual('Failure of profile GET unexpected');
      }
      expect(response.status).toEqual(200);
      const coach = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.coachProfile._id.toString() });
      expect(coach.status).toEqual(200);
      expect(coach.body.students.map(v => v._id.toString()).includes(mockData.studentProfile._id.toString())).toBeTruthy();
      const student = await superagent.get(`${apiUrl}/profiles`)
        .authBearer(mockData.adminToken)
        .query({ id: mockData.studentProfile._id.toString() });
      expect(student.status).toEqual(200);
      expect(student.body.studentData.coaches.map(v => v._id.toString()).includes(mockData.coachProfile._id.toString())).toBeTruthy();
    });

    test('GET 401 on attempt to attach student to coach by other than mentor or admin', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        coach: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.studentToken)
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
        coach: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 404 on attempt to attach student to unknown coach by mentor or admin', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        coach: 'THISISNOTAVALIDIDSTRING',
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 400 on bad query: misspelled student id', async () => {
      let response;
      const queryParams = {
        studnt: mockData.studentProfile._id.toString(),
        coach: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 400 on bad query: bad support role id', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        foobar: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/attach`)
          .authBearer(mockData.adminToken)
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
          .authBearer(mockData.adminToken);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });

  describe('GET DETACH ROUTE TESTING', () => {
    test('GET 200 on successful detach of student from coach by admin', async () => {
      // first attach them and verify they're attached.
      mockData.studentProfile.studentData.coaches.push(mockData.coachProfile._id);
      mockData.coachProfile.students.push(mockData.studentProfile._id);
      await mockData.studentProfile.save();
      await mockData.coachProfile.save();
      const student = await Profile.findById(mockData.studentProfile._id.toString());
      const coach = await Profile.findById(mockData.coachProfile._id.toString());
      expect(student.studentData.coaches[0]._id).toEqual(mockData.coachProfile._id);
      expect(coach.students[0]._id).toEqual(mockData.studentProfile._id);

      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        coach: mockData.coachProfile._id.toString(),
      };

      let response;
      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.status).toEqual('detach should have worked but didn\'t');
      }
    });

    test('GET 200 on successful detach of student from mentor by mentor', async () => {
      // first attach them and verify they're attached.
      mockData.studentProfile.studentData.mentor = mockData.mentorProfile._id;
      mockData.mentorProfile.students.push(mockData.studentProfile._id);
      await mockData.studentProfile.save();
      await mockData.mentorProfile.save();
      const student = await Profile.findById(mockData.studentProfile._id.toString());
      const mentor = await Profile.findById(mockData.mentorProfile._id.toString());
      console.log(student.studentData);
      expect(student.studentData.mentor._id).toEqual(mockData.mentorProfile._id);
      expect(mentor.students[0]._id).toEqual(mockData.studentProfile._id);
      // if we made it here we're ready to test detach route
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        mentor: mockData.mentorProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual(200);
      } catch (err) {
        expect(err.status).toEqual('detach should have worked but didn\'t');
      }
    });

    test('GET 401 on authorization error trying detach of student from mentor by coach', async () => {
      // first attach them and verify they're attached.
      mockData.studentProfile.studentData.mentor = mockData.mentorProfile._id;
      mockData.mentorProfile.students.push(mockData.studentProfile._id);
      await mockData.studentProfile.save();
      await mockData.mentorProfile.save();
      const student = await Profile.findById(mockData.studentProfile._id.toString());
      const mentor = await Profile.findById(mockData.mentorProfile._id.toString());
      expect(student.studentData.mentor._id).toEqual(mockData.mentorProfile._id);
      expect(mentor.students[0]._id.toString()).toEqual(mockData.studentProfile._id.toString());
      // if we made it here we're ready to test detach route
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        mentor: mockData.mentorProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.coachToken)
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
        coach: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 404 on attempt to detach student to unknown coach by mentor or admin', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        coach: 'THISISNOTAVALIDIDSTRING',
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(404);
      }
    });

    test('GET 400 on bad query: misspelled student id', async () => {
      let response;
      const queryParams = {
        studnt: mockData.studentProfile._id.toString(),
        coach: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.adminToken)
          .query(queryParams);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });

    test('GET 400 on bad query: bad support role id', async () => {
      let response;
      const queryParams = {
        student: mockData.studentProfile._id.toString(),
        foobar: mockData.coachProfile._id.toString(),
      };

      try {
        response = await superagent.get(`${apiUrl}/detach`)
          .authBearer(mockData.adminToken)
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
          .authBearer(mockData.adminToken);
        expect(response.status).toEqual('this get should have failed on a 404');
      } catch (err) {
        expect(err.status).toEqual(400);
      }
    });
  });
});
