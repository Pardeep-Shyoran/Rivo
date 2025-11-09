import mongoose from 'mongoose';

// Stores one document per user per day (UTC) tracking plays count and last play time.
// Enables streak computation server-side so it syncs across devices.
const playActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  day: {
    // Stored as YYYY-MM-DD string (UTC) for easy querying and uniqueness
    type: String,
    required: true,
    index: true,
  },
  plays: {
    type: Number,
    default: 0,
  },
  lastPlayAt: {
    type: Date,
    default: () => new Date(),
  },
}, { timestamps: true });

playActivitySchema.index({ userId: 1, day: 1 }, { unique: true });

export default mongoose.model('PlayActivity', playActivitySchema);