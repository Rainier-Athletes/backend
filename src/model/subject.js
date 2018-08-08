import mongoose from 'mongoose';

const subjectSchema = mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'teachers',
    required: true,
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Subject', subjectSchema, 'subjects', skipInit);