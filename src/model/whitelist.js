import mongoose from 'mongoose';

const whitelistSchema = mongoose.Schema({
  email: {
    type: String, 
    required: true,
  }
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Whitelist', whitelistSchema, 'whitelists', skipInit);