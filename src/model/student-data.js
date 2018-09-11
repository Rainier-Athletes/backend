import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const studentDataSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    autopopulate: { maxDepth: 1 },
  },
  lastPointTracker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointTracker',
    autopopulate: true,
  },
  coaches: [{
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: { maxDepth: 1 },
    },
    currentCoach: Boolean, // note: A student can have more than one current coach
  }],
  sports: [{ 
    sportName: String,
    team: String,
    league: String,
    currentlyPlaying: Boolean,
  }],
  mentors: [{
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: { maxDepth: 1 },
    },
    currentMentor: Boolean, // note: A student can only have ONE current mentor
  }],
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: { maxDepth: 1 },
    },
    currentTeacher: Boolean, // multiple current likely
  }],
  family: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      autopopulate: { maxDepth: 1 },
    },
    weekdayGuardian: Boolean,
    weekendGuardian: Boolean,
  }],
  gender: String,
  school: [{ 
    schoolName: String, 
    currentSchool: Boolean,
  }],
  dateOfBirth: Date,
  grade: Number,
  synopsisReportArchiveUrl: String,
  googleCalendarUrl: String,
  googleDocsUrl: String,
  synergy: {
    username: String,
    password: String, // this should probably be at least base64 encoded
  },
});

studentDataSchema.plugin(autopopulate);

const skipInit = process.env.NODE_ENV === 'development';
const StudentData = mongoose.model('StudentData', studentDataSchema, 'studentData', skipInit);

export default StudentData;
