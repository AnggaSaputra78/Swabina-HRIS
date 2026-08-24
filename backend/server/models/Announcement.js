import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: String,
  date: String,
  tag: String,
  tagColor: String,
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);