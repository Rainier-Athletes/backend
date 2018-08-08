import mongoose from 'mongoose';

const profileSchema = mongoose.Schema({
  firstName: { 
    type: String,
    required: true,
  },
  lastName: { 
    type: String,
    required: false,
  },
  email: String,
  Address: {
    Address: String,
    Apt: String,
    City: String,
    State: String,
    Zip: String,
  },
  profileImageUrl: String,
  role: {
    type: String,
    required: true,
    enum: ['admin', 'staff', 'student', 'mentor', 'teacher', 'coach', 'family'],
    default: 'coach',
  },
  studentRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'students',
  }],
  
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'attachments',
  }],
  garages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'garages',
  }],
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Profile', profileSchema, 'profiles', skipInit);
