import faker from 'faker';
import Profile from '../../model/profile';

const createProfileMockPromise = async () => {
  const mockData = {};

  const mockProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'student',
    address: faker.address.streetAddress(),
    phone: faker.phone.phoneNumberFormat(3),
    gender: 'male',
    school: 'skyline high school',
  };

  const mockMentorProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'mentor',
    address: faker.address.streetAddress(),
    phone: faker.phone.phoneNumberFormat(3),
    gender: 'female',
  };

  const mockCoachProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'coach',
    address: faker.address.streetAddress(),
    phone: faker.phone.phoneNumberFormat(3),
    gender: 'male',
  };

  const mockAdminProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'admin',
    address: faker.address.streetAddress(),
    phone: faker.phone.phoneNumberFormat(3),
    gender: 'female',
  };

  const mockTeacherProfile = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    role: 'teacher',
  };


  const newProfile = new Profile(mockProfile);
  const profile = await newProfile.save();
  const newMentor = new Profile(mockMentorProfile);
  const mentor = await newMentor.save();
  const coach = await new Profile(mockCoachProfile).save();
  const admin = await new Profile(mockAdminProfile).save();

  const teacher = await new Profile(mockTeacherProfile).save();
  mockData.teacherProfile = teacher;
  mockData.teacherToken = await teacher.createTokenPromise();


  mockData.mentorProfile = mentor;
  mockData.mentorToken = await mentor.createTokenPromise();

  mockData.adminProfile = admin;
  mockData.adminToken = await admin.createTokenPromise();

  mockData.coachProfile = coach;
  mockData.coachToken = await coach.createTokenPromise();

  mockData.studentProfile = profile;
  mockData.studentToken = await profile.createTokenPromise();

  mockData.profile = profile;
  mockData.token = mockData.studentToken;

  return mockData;
};

const removeAllResources = () => {
  return Profile.remove({});
};

export { createProfileMockPromise, removeAllResources };
