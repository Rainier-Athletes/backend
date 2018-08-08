import mongoose from 'mongoose';

const staffSchema = mongoose.Schema({
  firstName: { 
    type: String,
    required: true,
  },
  lastnameName: { 
    type: String,
    required: true,
  },
  email: String,
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Staff', staffSchema, 'staffMembers', skipInit);
