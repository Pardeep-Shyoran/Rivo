import mongoose from 'mongoose';

// Individual like events for tracks by users (listener or artist)
const trackLikeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'user'
  },
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'music'
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    index: true,
  },
  likedAt: {
    type: Date,
    default: () => new Date(),
    index: true,
  }
}, { timestamps: true });

trackLikeSchema.index({ userId: 1, trackId: 1 }, { unique: true });

export default mongoose.model('TrackLike', trackLikeSchema);