import mongoose from 'mongoose';

const mentorSchema = mongoose.Schema({
  firstName: { 
    type: String,
    required: true,
  },
  lastnameName: { 
    type: String,
    required: true,
  },
  email: String,
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'students',
  }],
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Mentor', mentorSchema, 'mentors', skipInit);
