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
    enum: ['admin', 'mentor'],
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
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Whitelist', whitelistSchema, 'whitelists', skipInit);
