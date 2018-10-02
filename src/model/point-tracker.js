import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import mongooseToCsvQuotes from 'mongoose-to-csv-quotes';

import StudentData from './student-data';

const pointTrackerSchema = mongoose.Schema({
  date: Date,
  title: {
    type: String,
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
      halfStamps: Number,
      tutorials: Number,
    },
    grade: {
      type: String,
      enum: ['', 'A', 'B', 'C', 'D', 'F'],
    },
  }],
  /*
  Face-to-face- Check In 
I met the parent at a mentor mentee check-in
Face-to-face: RA community event
Face-to-Face: Sports Game or Practice
Practice or game
Basecamp/Email (i)
I had communication via basecamp or email
Phone or text (i)
I had at least one interaction with my student’s family on the phone or text message
Mentor Meal
RA Scheduled Family Meeting (IEP, 504, etc) 
*/
  communications: [
    {
      with: {
        type: String,
        enum: ['student', 'family', 'coach', 'teacher'],
        default: 'student',
      },
      f2fCheckIn: Boolean,
      f2fRaEvent: Boolean,
      f2fGameOrPractice: Boolean,
      basecampOrEmail: Boolean,
      phoneOrText: Boolean,
      familyMeeting: Boolean,
      notes: String,
    },
  ],
  /* Point Sheet Status:
Student turned in a physical point sheet 
Student lost point sheet
Student did not complete a point sheet (At a glance, looks like less than 25% is completed with X’s or Stamps) 
Student Absent (RA Staff to retroactively confirm PS status) 
Notes- optional (i.e student lost point sheet on tuesday and completed the rest of their point sheet from Wed-Friday)
*/
  pointSheetStatus: {
    turnedIn: Boolean,
    lost: Boolean,
    incomplete: Boolean,
    absent: Boolean,
    notes: String,
  },
  /*
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
  */
  earnedPlayingTime: String,
  mentorGrantedPlayingTime: String,
  synopsisComments: {
    mentorGrantedPlayingTimeComments: String, // required only if mentor overrides calculated playing time
    studentActionItems: String,
    sportsUpdate: String,
    additionalComments: String,
  },
}, { timestamps: true });
pointTrackerSchema.plugin(autopopulate);

const headers = ['title',
  'student.active',
  'student.firstName',
  'student.lastName',
  'student.email',
  'student.phone',
  'student.gender',
  'student.school',
  'mentorIsSubstitute',
  'mentor.firstName',
  'mentor.lastName',
  'surveyQuestions.mentorAttendedCheckin',
  'surveyQuestions.metFaceToFace', 
  'surveyQuestions.hadOtherCommunication',
  'surveyQuestions.hadNoCommunication',
  'surveyQuestions.scoreSheetTurnedIn',
  'surveyQuestions.scoreSheetLostOrIncomplete',
  'surveyQuestions.scoreSheetWillBeLate',
  'surveyQuestions.scoreSheetOther',
  'surveyQuestions.scoreSheetOtherReason',
  'surveyQuestions.synopsisInformationComplete',
  'surveyQuestions.synopsisInformationIncomplete',
  'surveyQuestions.synopsisCompletedByRaStaff',
  'synopsisComments.extraPlayingTime',
  'synopsisComments.mentorGrantedPlayingTime',
  'synopsisComments.studentActionItems',
  'synopsisComments.sportsUpdate',
  'synopsisComments.additionalComments',
  'subject.1',
  'subject.1.excusedDays',
  'subject.1.stamps',
  'subject.1.halfStamp',
  'subjects.1.tutorials',
  'subjects.1.grade',
  'subject.2',
  'subject.2.excusedDays',
  'subject.2.stamps',
  'subject.2.halfStamp',
  'subjects.2.tutorials',
  'subjects.2.grade',  
  'subject.3',
  'subject.3.excusedDays',
  'subject.3.stamps',
  'subject.3.halfStamp',
  'subjects.3.tutorials',
  'subjects.3.grade',  
  'subject.4',
  'subject.4.excusedDays',
  'subject.4.stamps',
  'subject.4.halfStamp',
  'subjects.4.tutorials',
  'subjects.4.grade',  
  'subject.5',
  'subject.5.excusedDays',
  'subject.5.stamps',
  'subject.5.halfStamp',
  'subjects.5.tutorials',
  'subjects.5.grade',  
  'subject.6',
  'subject.6.excusedDays',
  'subject.6.stamps',
  'subject.6.halfStamp',
  'subjects.6.tutorials',
  'subjects.6.grade',  
  'subject.7',
  'subject.7.excusedDays',
  'subject.7.stamps',
  'subject.7.halfStamp',
  'subjects.7.tutorials',
  'subjects.7.grade',
  'subject.8',
  'subject.8.excusedDays',
  'subject.8.stamps',
  'subject.8.halfStamp',
  'subjects.8.tutorials',
  'subjects.8.grade',
];

const alias = {
  'subject.1': 'subjects[0].subjectName',
  'subject.1.excusedDays': 'subjects[0].scoring.excusedDays',
  'subject.1.stamps': 'subjects[0].scoring.stamps',
  'subject.1.halfStamp': 'subjects[0].scoring.halfStamp',
  'subject.1.tutorials': 'subjects[0].scoring.tutorials',
  'subject.1.grade': 'subjects[0].grade',
  'subject.2': 'subjects[1].subjectName',
  'subject.2.excusedDays': 'subjects[1].scoring.excusedDays',
  'subject.2.stamps': 'subjects[1].scoring.stamps',
  'subject.2.halfStamp': 'subjects[1].scoring.halfStamp',
  'subject.2.tutorials': 'subjects[1].scoring.tutorials',
  'subject.2.grade': 'subjects[1].grade',
  'subject.3': 'subjects[2].subjectName',
  'subject.3.excusedDays': 'subjects[2].scoring.excusedDays',
  'subject.3.stamps': 'subjects[2].scoring.stamps',
  'subject.3.halfStamp': 'subjects[2].scoring.halfStamp',
  'subject.3.tutorials': 'subjects[2].scoring.tutorials',
  'subject.3.grade': 'subjects[2].grade',
  'subject.4': 'subjects[3].subjectName',
  'subject.4.excusedDays': 'subjects[3].scoring.excusedDays',
  'subject.4.stamps': 'subjects[3].scoring.stamps',
  'subject.4.halfStamp': 'subjects[3].scoring.halfStamp',
  'subject.4.tutorials': 'subjects[3].scoring.tutorials',
  'subject.4.grade': 'subjects[3].grade',
  'subject.5': 'subjects[4].subjectName',
  'subject.5.excusedDays': 'subjects[4].scoring.excusedDays',
  'subject.5.stamps': 'subjects[4].scoring.stamps',
  'subject.5.halfStamp': 'subjects[4].scoring.halfStamp',
  'subject.5.tutorials': 'subjects[4].scoring.tutorials',
  'subject.5.grade': 'subjects[4].grade',
  'subject.6': 'subjects[5].subjectName',
  'subject.6.excusedDays': 'subjects[5].scoring.excusedDays',
  'subject.6.stamps': 'subjects[5].scoring.stamps',
  'subject.6.halfStamp': 'subjects[5].scoring.halfStamp',
  'subject.6.tutorials': 'subjects[5].scoring.tutorials',
  'subject.6.grade': 'subjects[5].grade',
  'subject.7': 'subjects[6].subjectName',
  'subject.7.excusedDays': 'subjects[6].scoring.excusedDays',
  'subject.7.stamps': 'subjects[6].scoring.stamps',
  'subject.7.halfStamp': 'subjects[6].scoring.halfStamp',
  'subject.7.tutorials': 'subjects[6].scoring.tutorials',
  'subject.7.grade': 'subjects[6].grade',
  'subject.8': 'subjects[7].subjectName',
  'subject.8.excusedDays': 'subjects[7].scoring.excusedDays',
  'subject.8.stamps': 'subjects[7].scoring.stamps',
  'subject.8.halfStamp': 'subjects[7].scoring.halfStamp',
  'subject.8.tutorials': 'subjects[7].scoring.tutorials',
  'subject.8.grade': 'subjects[7].grade',
};

pointTrackerSchema.plugin(mongooseToCsvQuotes, { show_headers: true, headers, alias });

pointTrackerSchema.post('save', async (tracker) => {
  const studentData = await StudentData.findOne({ student: tracker.student });
  // studentData may be null, particularly in the case of mocking test
  // data. If it is just ignore.
  if (studentData) studentData.lastPointTracker = tracker._id;
  return studentData ? studentData.save() : undefined;
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('PointTracker', pointTrackerSchema, 'pointTrackers', skipInit);
