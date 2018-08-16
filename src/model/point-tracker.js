import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import Profile from './profile';

const pointTrackerSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile',
    required: true,
    autopopulate: true,
  },
  subjects: [{
    subjectName: {
      type: String,
      required: true,
    },
    teacher: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Profile', 
      autopopulate: true,
    },
    scoring: {
      excusedDays: Number,
      stamps: Number,
      halfStamp: Number,
      tutorials: Number,
    },
    grade: Number,
  }],
  surveyQuestions: {
    mentorAttendedCheckin: Boolean,
    metFaceToFace: Boolean,
    hadOtherCommunication: Boolean,
    hadNoCommunication: Boolean,
    scoreSheetTurnedIn: Boolean,
    scoreSheetLostOrIncomplete: Boolean,
    scoreSheetWillBeLate: Boolean,
    scoreSheetOther: Boolean,
    scoreSheetOtherReason: String,
    // grades question we can skip as we'll have that data separately.
    synopsisInformationComplete: Boolean,
    synopsisInformationIncomplete: Boolean,
    synopsisCompletedByRaStaff: Boolean,
    // playing time earned and explanation handled via synopsisComments
  },
  synopsisComments: {
    extraPlayingTime: String,
    mentorGrantedPlayingTime: String,
    studentActionItems: String,
    sportsUpdate: String,
    additionalComments: String,
  },
});
pointTrackerSchema.plugin(autopopulate);

// pointTrackerSchema.post('save', (tracker) => {
//   Profile.findById(tracker.studentId)
//     .then((profile) => {
//       if (!profile.studentData.pointTrackers.map(v => v.toString()).includes(tracker._id.toString())) {
//         profile.studentData.pointTrackers.push(tracker._id);
//       }
//       return profile.save();
//     })
//     .catch((err) => {
//       throw err;
//     });
// });

pointTrackerSchema.post('save', async (tracker) => {
  const student = await Profile.findById(tracker.student);
  student.studentData.lastPointTracker = tracker._id;
  return student.save();
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('PointTracker', pointTrackerSchema, 'pointTrackers', skipInit);

/*
const mockPointTrackerData = {
  date: 1533761272724,
  studentId: '1EF12348902093DECBA908',
  subjects: [{
    subjectName: 'Social Studies',
    teacher: '1EF12348902093DECBA910',
    scoring: {
      excusedDays: 1,
      stamps: 14,
      x: 3,
      tutorials: 1,
    },
  },
  {
    subjectName: 'Math',
    teacher: '1EF12348902093DECBA912',
    scoring: {
      excusedDays: 1,
      stamps: 12,
      x: 6,
      tutorials: 0,
    },
  },
  {
    subjectName: 'Biology',
    teacher: '1EF12348902093DECBA914',
    scoring: {
      excusedDays: 1,
      stamps: 16,
      x: 1,
      tutorials: 2,
    },
  }],
  surveyQuestions: {
    attendedCheckin: true,
    metFaceToFace: true,
    hadOtherCommunication: false,
    scoreSheetTurnedIn: true,
  },
  synopsisComments: {
    extraPlayingTime: 'Jamie is working hard toward his goals. We agreed that if he achieved a small improvement this week he would get extra playing time.',
    studentActionItems: 'Jamie agreed to attend 1 more tutorial in each of his classes this coming week',
    sportsUpdate: 'Last week Jamie had a great game against the Cardinals. Had two hits and caught three fly balls!',
    additionalComments: '',
  },
};
*/
// ..
