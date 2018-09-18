import faker from 'faker';
import Profile from '../../model/profile';

const createProfileMockPromise = async () => {
  const mockData = {};

  const mockStudentProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'student',
    phone: faker.phone.phoneNumberFormat(3),
    studentData: null,
  };

  const mockMentorProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'mentor',
    phone: faker.phone.phoneNumberFormat(3),
  };

  const mockCoachProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'coach',
    phone: faker.phone.phoneNumberFormat(3),
  };

  const mockAdminProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'admin',
    phone: faker.phone.phoneNumberFormat(3),
  };

  const mockTeacherProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'teacher',
  };

  const mockFamily1Profile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'family',
    phone: faker.phone.phoneNumberFormat(3),
  };

  const mockFamily2Profile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'family',
    phone: faker.phone.phoneNumberFormat(3),
  };

  const student = await new Profile(mockStudentProfile).save();
  const mentor = await new Profile(mockMentorProfile).save();
  const coach = await new Profile(mockCoachProfile).save();
  const admin = await new Profile(mockAdminProfile).save();
  const teacher = await new Profile(mockTeacherProfile).save();
  const family1 = await new Profile(mockFamily1Profile).save();
  const family2 = await new Profile(mockFamily2Profile).save();

  mockData.teacherProfile = teacher;
  mockData.teacherToken = await teacher.createTokenPromise();

  mockData.mentorProfile = mentor;
  mockData.mentorToken = await mentor.createTokenPromise();

  mockData.adminProfile = admin;
  mockData.adminToken = await admin.createTokenPromise();

  mockData.coachProfile = coach;
  mockData.coachToken = await coach.createTokenPromise();

  mockData.studentProfile = student;
  mockData.studentToken = await student.createTokenPromise();

  mockData.family1Profile = family1;
  mockData.family2Profile = family2;

  mockData.profile = student;
  mockData.token = mockData.studentToken;

  return mockData;
};

const removeAllResources = () => {
  return Profile.deleteMany({});
};

export { createProfileMockPromise, removeAllResources };
