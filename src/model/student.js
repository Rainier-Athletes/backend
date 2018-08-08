import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: String,
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'students',
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subjects',
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teams',
  }],
  scores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'scores',
  }],
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Student', studentSchema, 'students', skipInit);
