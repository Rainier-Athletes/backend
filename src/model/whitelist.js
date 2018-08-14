import mongoose from 'mongoose';

const whitelistSchema = mongoose.Schema({
  email: {
    type: String, 
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'mentor', 'coach', 'teacher', 'family', 'student'],
    default: 'mentor',
  },
  firstName: { 
    type: String,
    required: true,
  },
  lastName: { 
    type: String,
    required: true,
  },

  googleToken: {
    type: String, 
    // required: true, 
    unique: true,

  pending: {
    type: Boolean,
    default: true,

  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Whitelist', whitelistSchema, 'whitelists', skipInit);
