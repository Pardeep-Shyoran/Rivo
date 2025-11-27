import DailyTrackStat from '../models/dailyTrackStat.model.js';
import musicModel from '../models/music.model.js';
import playlistModel from '../models/playlist.model.js';
import followModel from '../models/follow.model.js';

// GET /api/music/artist/analytics/plays?range=30d
export async function getArtistPlaysTrend(req, res) {
  try {
    const artistId = req.user.id;
    const { range = '30d' } = req.query;
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const today = new Date();
    const startDate = new Date(today.getTime() - (days - 1) * 86400000);
    const startDayStr = startDate.toISOString().slice(0,10);

    const stats = await DailyTrackStat.find({ artistId, day: { $gte: startDayStr } }).lean();
    const playsByDay = new Map();
    for (let s of stats) {
      playsByDay.set(s.day, (playsByDay.get(s.day) || 0) + (s.plays || 0));
    }

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today.getTime() - (days - 1 - i) * 86400000).toISOString().slice(0,10);
      result.push({ day: d, plays: playsByDay.get(d) || 0 });
    }
    return res.status(200).json({ range: days, data: result });
  } catch (err) {
    console.error('Error fetching plays trend:', err);
    return res.status(500).json({ message: 'Error fetching plays trend', error: err.message });
  }
}

// GET /api/music/artist/analytics/followers?range=30d
export async function getArtistFollowersTrend(req, res) {
  try {
    const artistId = req.user.id;
    const { range = '30d' } = req.query;
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const today = new Date();
    const startDate = new Date(today.getTime() - (days - 1) * 86400000);
    const startStr = startDate.toISOString().slice(0,10);

    const follows = await followModel.find({ artistId, createdAt: { $gte: startDate } }).lean();
    const countsByDay = new Map();
    for (let f of follows) {
      const day = f.createdAt.toISOString().slice(0,10);
      countsByDay.set(day, (countsByDay.get(day) || 0) + 1);
    }

    const cumulative = [];
    let running = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(today.getTime() - (days - 1 - i) * 86400000).toISOString().slice(0,10);
      running += countsByDay.get(d) || 0;
      cumulative.push({ day: d, newFollowers: countsByDay.get(d) || 0, cumulativeFollowers: running });
    }
    return res.status(200).json({ range: days, data: cumulative });
  } catch (err) {
    console.error('Error fetching followers trend:', err);
    return res.status(500).json({ message: 'Error fetching followers trend', error: err.message });
  }
}

// GET /api/music/artist/analytics/engagement?range=30d
export async function getArtistEngagement(req, res) {
  try {
    const artistId = req.user.id;
    const { range = '30d' } = req.query;
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const today = new Date();
    const startDate = new Date(today.getTime() - (days - 1) * 86400000);
    const startDayStr = startDate.toISOString().slice(0,10);
    const stats = await DailyTrackStat.find({ artistId, day: { $gte: startDayStr } }).lean();
    let plays = 0, likes = 0;
    for (let s of stats) { plays += s.plays || 0; likes += s.likes || 0; }
    const engagementPct = plays ? Math.min((likes / plays) * 100, 100) : 0;
    return res.status(200).json({ range: days, plays, likes, engagementPct: Number(engagementPct.toFixed(2)) });
  } catch (err) {
    console.error('Error fetching engagement:', err);
    return res.status(500).json({ message: 'Error fetching engagement', error: err.message });
  }
}

// GET /api/music/artist/analytics/summary
export async function getArtistSummary(req, res) {
  try {
    const artistId = req.user.id;
    const [tracks, playlists, followers] = await Promise.all([
      musicModel.find({ artistId }).select({ playCount: 1, likeCount: 1 }).lean(),
      playlistModel.countDocuments({ artistId }),
      followModel.countDocuments({ artistId })
    ]);
    const totalTracks = tracks.length;
    const totalPlays = tracks.reduce((sum, t) => sum + (t.playCount || 0), 0);
    const totalLikes = tracks.reduce((sum, t) => sum + (t.likeCount || 0), 0);
    const avgPlaysPerTrack = totalTracks ? Math.round(totalPlays / totalTracks) : 0;
    const engagementPct = totalPlays ? Math.min((totalLikes / totalPlays) * 100, 100).toFixed(2) : '0.00';
    return res.status(200).json({
      totalTracks,
      totalPlays,
      avgPlaysPerTrack,
      playlists,
      followers,
      engagementPct
    });
  } catch (err) {
    console.error('Error fetching artist summary:', err);
    return res.status(500).json({ message: 'Error fetching artist summary', error: err.message });
  }
}
