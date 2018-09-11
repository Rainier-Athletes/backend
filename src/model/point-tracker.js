import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
// import mongooseToCsv from 'mongoose-to-csv';

import StudentData from './student-data';

const pointTrackerSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  mentor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  mentorIsSubstitute: Boolean, 
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
}, { timestamps: true });
pointTrackerSchema.plugin(autopopulate);
// pointTrackerSchema.plugin(mongooseToCsv, { headers: [] });

pointTrackerSchema.post('save', async (tracker) => {
  const studentData = await StudentData.findOne({ student: tracker.student });
  // studentData may be null, particularly in the case of mocking test
  // data. If it is just ignore.
  if (studentData) studentData.lastPointTracker = tracker._id;
  return studentData ? studentData.save() : undefined;
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('PointTracker', pointTrackerSchema, 'pointTrackers', skipInit);
