import mongoose from 'mongoose';

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
  picture: String,
  role: {
    type: String,
    required: true,
    enum: ['admin', 'staff', 'student', 'mentor', 'teacher', 'coach', 'family'],
    default: 'family',
  },
  profileId: {
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
  teacherData: {
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    }],
  },
  familyData: {
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    }],
  },
  
});

const skipInit = process.env.NODE_ENV === 'development';
const Profile = mongoose.model('Profile', profileSchema, 'profiles', skipInit);

// const studentProfilePostSave = async (student) => {
//   // a saved student profile may have new references
//   // to their mentor or coach(es). 
//   console.log('post save student, profile:', JSON.stringify(student, null, 4));
//   if (student.studentData.mentor) {
//     try {
//       const mentor = await Profile.findById(student.studentData.mentor);
//       if (!mentor.mentorData.students.map(v => v.toString()).includes(student._id.toString())) {
//         mentor.mentorData.students.push(student._id);
//         console.log('post save student, saving mentor profile:', JSON.stringify(mentor, null, 4));
//         await mentor.save();
//       }
//     } catch (err) {
//       logger.log(logger.ERROR, `studentProfilePostSave mongoose error finding mentor ${student.studentData.mentor}`);
//       return Promise.reject(err);
//     }
//   }

//   const updateCoach = async (coach, studentId) => {
//     try {
//       const coachProfile = await Profile.findById(coach);
//       console.log('updateCoach, found coach', coachProfile);
//       if (!coachProfile.coachData.students.map(v => v.toString()).includes(studentId.toString())) {
//         coachProfile.coachData.students.push(studentId);
//         console.log('updateCoach, saving', coachProfile);
//         await coachProfile.save();
//         console.log('update coach back from save');
//       }
//     } catch (err) {
//       logger.log(logger.ERROR, `studentProfilePostSave mongoose error finding coach ${coach}`);
//       return Promise.reject(err);
//     }
//     return undefined;
//   };

//   // check coaches to be sure they refer back to student
//   if (student.studentData.coaches.length > 0) {
//     const { coaches } = student.studentData;
//     console.log('studentProfilePostSave working on coaches', coaches);
//     for (let i = 0; i < coaches.length; i++) {
//       updateCoach(coaches[i], student._id);
//     }
//   }
//   return undefined;
// };

// const supportProfilePostSave = async (profile) => {
//   console.log('post save Support profile:', JSON.stringify(profile, null, 4));
//   // these can be either mentor or coach profiles.
//   const dataProp = `${profile.role}Data`;
//   // student array is at mentor.mentorData.students, e.g.
//   const { students } = profile[dataProp];
//   console.log('... dataProp', dataProp, 'students', students);
//   // students holds _id's of mentor or coaches mentees
//   // get their profiles
//   const studentProfiles = [];
//   for (let i = 0; i < students.length; i++) {
//     studentProfiles.push(Profile.findById(students[i]));
//   }
//   await Promise.all(studentProfiles);
//   // studentProfiles[0] = await Profile.findById(students[0]);
//   // studentProfiles is an array of Query objects, not profiles!
//   console.log('... studentProfiles', studentProfiles);
//   const savedProfiles = [];
//   for (let i = 0; i < studentProfiles.length; i++) {
//     switch (profile.role) {
//       case 'mentor':
//         if (!studentProfiles[i].studentData.mentor.toString() !== profile._id.toString()) {
//           studentProfiles[i].studentData.mentor = profile._id;
//           savedProfiles.push(studentProfiles[i].save());
//         }
//         break;
//       case 'coaches':
//         if (!studentProfiles[i].studentData.coaches.map(v => v.toString()).includes(profile._id.toString())) {
//           studentProfiles[i].studentData.coaches.push(profile._id);
//           savedProfiles.push(studentProfiles[i].save());
//         }
//         break;
//       default:
//     }
//   }
//   return Promise.all(savedProfiles);
// };

// profileSchema.post('save', async (profile) => {
//   console.log('>>>> profileSchema.post(save) profile', JSON.stringify(profile, null, 4));
//   // if role is student, check that student's mentor
//   // and coach(s) include the student's _id
//   if (profile.role === 'student') {
//     await studentProfilePostSave(profile);
//   }
//   // if role is mentor, check that student's include mentor's _id
//   // if roal is coach, check that student's include coach's _id
//   // if (profile.role === 'mentor' || profile.role === 'coach') {
//   //   return supportProfilePostSave(profile);
//   // }
//   return undefined;
// });

// const postRemoveStudentFromMentor = async (student) => { 
//   const mentor = await Profile.findById(student.mentor._id);
//   if (mentor) {
//     mentor.mentorData.students = mentor.mentorData.students.filter(id => id.toString() !== student._id.toString());
//     return mentor.save();
//   }
//   return undefined;
// };

// const postRemoveStudentFromCoach = async (coachId, studentId) => {
//   const coach = Profile.findOneById(coachId);
//   if (coach) {
//     coach.coachData.students = coach.coachData.students.filter(id => id.toString() !== studentId.toString());
//     return coach.save();
//   }
//   return undefined;
// };

profileSchema.post('remove', async (profile) => {
  if (profile.role === 'student') { 
    // clean up student's mentor and coaches
    if (profile.studentData.mentor) await postRemoveStudentFromMentor(profile);
    if (profile.studentData.coaches.length > 0) {
      for (let i = 0; i < profile.studentData.coaches.length; i++) {
        postRemoveStudentFromCoach(profile.studentData.coaches[i], profile._id);
      }
    }
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
