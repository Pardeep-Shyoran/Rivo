import mongoose from 'mongoose';

// Stores per-track per-day aggregated metrics for fast artist analytics.
// day stored as YYYY-MM-DD (UTC) string.
const dailyTrackStatSchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'music'
  },
  day: {
    type: String,
    required: true,
    index: true,
  },
  plays: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

dailyTrackStatSchema.index({ artistId: 1, trackId: 1, day: 1 }, { unique: true });
dailyTrackStatSchema.index({ artistId: 1, day: 1 });

export default mongoose.model('DailyTrackStat', dailyTrackStatSchema);