import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import jsonWebToken from 'jsonwebtoken';
import logger from '../lib/logger';

const profileSchema = mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
  },
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
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'student', 'mentor', 'teacher', 'coach', 'family'],
    default: 'family',
  },
  address: {
    street: String,
    apt: String,
    city: String,
    state: String,
    zip: String,
  },
  phone: String,
  picture: String,
  studentData: {
    lastPointTracker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointTracker',
      autopopulate: true,
    },
    coaches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: true,
    }],
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: true,
    },
    teachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: true,
    }],
    family: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: true,
    }],
  },
  gender: String,
  school: String,
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    autopopulate: { maxDepth: 1 },
  }],  
});

profileSchema.plugin(autopopulate);

profileSchema.methods.createTokenPromise = async function createTokenPromise(googleTokenResponse = {}) {
  try {
    return Promise.resolve(jsonWebToken.sign({ profileId: this._id.toString(), role: this.role, googleTokenResponse }, process.env.SECRET));
  } catch (err) {
    logger.log(logger.ERROR, `ERROR SAVING ACCOUNT or ERROR WITH JWT: ${JSON.stringify(err)}`);
    return Promise.reject(err);
  }
};

const skipInit = process.env.NODE_ENV === 'development';
const Profile = mongoose.model('Profile', profileSchema, 'profiles', skipInit);

export default Profile;

// const mockStudentProfile = {
//   active: true,
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
//   studentData: {},
//   mentorData: {},
// };
