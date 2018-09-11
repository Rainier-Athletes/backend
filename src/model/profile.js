import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import jsonWebToken from 'jsonwebtoken';
import logger from '../lib/logger';

const profileSchema = mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
  },
  firstName: { 
    type: String,
    required: true,
  },
  lastName: { 
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  raEmail: String,
  role: {
    type: String,
    required: true,
    enum: ['admin', 'student', 'mentor', 'teacher', 'coach', 'family'],
    default: 'family',
  },
  address: {
    street: String,
    apt: String,
    city: String,
    state: String,
    zip: String,
  },
  phone: String,
  cellPhone: String,
  picture: String,
  studentData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentData',
    autopopulate: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    autopopulate: { maxDepth: 1 },
  }],  
});

profileSchema.plugin(autopopulate);

profileSchema.methods.createTokenPromise = async function createTokenPromise(googleTokenResponse = {}) {
  try {
    return Promise.resolve(jsonWebToken.sign({ profileId: this._id.toString(), role: this.role, googleTokenResponse }, process.env.SECRET));
  } catch (err) {
    logger.log(logger.ERROR, `ERROR SAVING ACCOUNT or ERROR WITH JWT: ${JSON.stringify(err)}`);
    return Promise.reject(err);
  }
};

const skipInit = process.env.NODE_ENV === 'development';
const Profile = mongoose.model('Profile', profileSchema, 'profiles', skipInit);

export default Profile;
