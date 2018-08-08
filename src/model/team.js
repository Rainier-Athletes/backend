import mongoose from 'mongoose';

const teamSchema = mongoose.Schema({
  name: { 
    type: String,
    required: true,
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sports',
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'students',
  }],
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('Team', teamSchema, 'teams', skipInit);
