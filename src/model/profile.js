import mongoose from 'mongoose';

const profileSchema = mongoose.Schema({
  firstName: { 
    type: String,
    required: true,
  },
  lastName: { 
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  address: {
    street: String,
    apt: String,
    city: String,
    state: String,
    zip: String,
  },
  phone: String,
  role: {
    type: String,
    required: true,
    enum: ['admin', 'staff', 'student', 'mentor', 'teacher', 'coach', 'family'],
    default: 'family',
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  studentData: {
    pointTrackers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointTracker',
    }],
    coaches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    }],
    school: String,
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    teachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    }],
    family: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    }],
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male',
      required: true,
    },
  },
  mentorData: {
    school: String,
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    }],
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Profile', profileSchema, 'profiles', skipInit);

// const mockStudentProfile = {
//   firstName: 'Jamie',
//   lastName: 'McPheters',
//   email: 'jamiemcp@gmail.com',
//   address: {
//     street: '615 6th St',
//     apt: 'Apt 202',
//     city: 'Bellevue',
//     state: 'WA',
//     zip: '98007',
//   },
//   phone: '425-643-5178',
//   role: 'student',
//   accountId: '1EF12348902093DECBA914',
//   studentData: {
//     scoringReports: ['1EF12348902093DECBA914', '1EF12348902093DECBA916', '1EF12348902093DECBA914'],
//     coaches: ['1EF12348902093DECBA920'],
//     school: 'Odle Middle School',
//     mentor: '1EF12348902093DECBA914',
//     teachers: ['1EF12348902093DECBA914', '1EF12348902093DECBA916', '1EF12348902093DECBA914', '1EF12348902093DECBA914', '1EF12348902093DECBA916', '1EF12348902093DECBA914', '1EF12348902093DECBA914'],
//     family: ['1EF12348902093DECBA914', '1EF12348902093DECBA916'],
//     gender: 'male',
//   },
//   mentorData: {},
// };

// const mockMentorProfile = {
//   firstName: 'Ryan',
//   lastName: 'Smithers',
//   email: 'ryan@rainierathletes.com',
//   address: {
//     street: '1714 147th Ave SE',
//     apt: '',
//     city: 'Bellevue',
//     state: 'WA',
//     zip: '98007',
//   },
//   phone: '425-648-2212',
//   role: 'mentor',
//   accountId: '1EF12348902093DECBA914',
//   studentData: {},
//   mentorData: {
//     students: ['1EF12348902093DECBA914', '1EF12348902093DECBA916'],
//   },
// };

// const mockPersonProfile = {
//   firstName: 'Generic',
//   lastName: 'Person',
//   email: 'anybody@gmail.com',
//   address: {
//     street: '12345 67th St NW',
//     apt: '',
//     city: 'Bellevue',
//     state: 'WA',
//     zip: '98007',
//   },
//   phone: '425-648-5555',
//   role: 'teacher',
//   accountId: '1EF12348902093DECBA914',
//   studentData: {},
//   mentorData: {},
// };
