import mongoose from 'mongoose';
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
  coachData: {
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    }],
  },
});

const skipInit = process.env.NODE_ENV === 'development';
const Profile = mongoose.model('Profile', profileSchema, 'profiles', skipInit);

const studentProfilePostSave = async (student) => {
  // a saved student profile may have new references
  // to their mentor or coach(es). 
  if (student.studentData.mentor) {
    try {
      const mentor = await Profile.findById(student.studentData.mentor);
      if (!mentor.mentorData.students.map(v => v.toString()).includes(student._id.toString())) {
        mentor.mentorData.students.push(student._id);
        return mentor.save();
      }
    } catch (err) {
      logger.log(logger.ERROR, `studentProfilePostSave mongoose error finding mentor ${student.studentData.mentor}`);
      return Promise.reject(err);
    }
  }

  // check coaches to be sure they refer back to student
  if (student.studentData.coaches.length > 0) {
    const { coaches } = student.studentData;
    const coachProfiles = [];
    for (let i = 0; i < coaches.length; i++) {
      coachProfiles.push(Profile.findById(coaches[i]));
    }
    await Promise.all(coachProfiles);
    for (let i = 0; i < coachProfiles.length; i++) {
      if (!coachProfiles[i].students.map(v => v.toString()).includes(student._id.toString())) {
        coachProfiles[i].students.push(student._id);
      }
    }
    const savedProfiles = [];
    for (let i = 0; i < coachProfiles.length; i++) {
      savedProfiles.push(coachProfiles[i].save());
    }
    return Promise.all(savedProfiles);
  }
  return undefined;
};

const supportProfilePostSave = async (profile) => {
  // these can be either mentor or coach profiles.
  const dataProp = `${profile.role}Data`;
  const { students } = profile[dataProp];
  // students holds _id's of mentor or coaches mentees
  // get their profiles
  const studentProfiles = [];
  for (let i = 0; i < students.length; i++) {
    studentProfiles.push(Profile.findById(students[i]));
  }
  await Promise.all(studentProfiles);
  const savedProfiles = [];
  for (let i = 0; i < studentProfiles.length; i++) {
    switch (profile.role) {
      case 'mentor':
        if (!studentProfiles[i].studentData.mentor.toString() !== profile._id.toString()) {
          studentProfiles[i].studentData.mentor = profile._id;
          savedProfiles.push(studentProfiles[i].save());
        }
        break;
      case 'coaches':
        if (!studentProfiles[i].studentData.coaches.map(v => v.toString()).includes(profile._id.toString())) {
          studentProfiles[i].studentData.coaches.push(profile._id);
          savedProfiles.push(studentProfiles[i].save());
        }
        break;
      default:
    }
  }
  return Promise.all(savedProfiles);
};

profileSchema.post('save', (profile) => {
  // if role is student, check that student's mentor
  // and coach(s) include the student's _id
  if (profile.role === 'student') {
    return studentProfilePostSave(profile);
  }
  // if role is mentor, check that student's include
  // mentor's _id
  // if roal is coach, check that student's include
  // coach's _id
  if (profile.role === 'mentor' || profile.role === 'coach') {
    return supportProfilePostSave(profile);
  }
  return undefined;
});

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
