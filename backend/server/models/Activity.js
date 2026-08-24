import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: String,
  activity: String,
  module: String,
  moduleColor: String,
  time: String,
  avatar: String,
  avatarBg: String,
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);