import mongoose from 'mongoose';

const teacherSchema = mongoose.Schema({
  firstName: { 
    type: String,
    required: true,
  },
  lastnameName: { 
    type: String,
    required: true,
  },
  email: String,
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subjects',
  }],
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Teacher', teacherSchema, 'teachers', skipInit);
