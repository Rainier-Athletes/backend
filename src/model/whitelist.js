import mongoose from 'mongoose';

const whitelistSchema = mongoose.Schema({
  email: String, 
  studentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profiles',
  }
  first
})