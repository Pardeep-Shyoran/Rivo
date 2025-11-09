import mongoose from 'mongoose';

// Stores individual play events for detailed listening history
// Used for "Recently Played", analytics, and recommendations
const playHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  musicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music',
    required: true,
  },
  playedAt: {
    type: Date,
    default: () => new Date(),
    index: true,
  },
  // Optional: duration listened (in seconds) for analytics
  duration: {
    type: Number,
    default: 0,
  },
  // Optional: device info for cross-device insights
  deviceId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// Compound index for efficient user history queries (most recent first)
playHistorySchema.index({ userId: 1, playedAt: -1 });

// Index for cleanup/archival queries
playHistorySchema.index({ playedAt: -1 });

export default mongoose.model('PlayHistory', playHistorySchema);
