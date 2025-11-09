import { uploadFile, getPresignedUrl } from "../services/storage.service.js";
import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";
import playActivityModel from "../models/playActivity.model.js";
import playHistoryModel from "../models/playHistory.model.js";


export async function getAllMusics(req, res) {

  const {skip=0, limit=10} = req.query;

  try {
    const musicsDocs = await musicModel.find({}).skip(skip).limit(limit).lean();

    const musics = [];

    for (let music of musicsDocs) {
      music.musicUrl = await getPresignedUrl(music.musicKey);
      music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
      musics.push(music);
    }

    return res.status(200).json({
      message: "All musics fetched successfully",
      musics,
    });
  } catch (err) {
    console.error("Error fetching all musics:", err);
    res.status(500).json({
      message: "Error fetching all musics",
      error: err.message,
    });
  }
}

export async function getMusicById(req, res) {
  const { id } = req.params;

  try{
    const music = await musicModel.findById(id).lean();

    if(!music){
      return res.status(404).json({
        message: "Music not found",
      });
    }

    music.musicUrl = await getPresignedUrl(music.musicKey);
    music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
    
    return res.status(200).json({
      message: "Music fetched successfully",
      music,
    });
  }catch(err){
    console.error("Error fetching music by ID:", err);
    res.status(500).json({
      message: "Error fetching music by ID",
      error: err.message,
    });
  }
}

export async function uploadMusic(req, res) {
  try {
    // Validate that files were uploaded
    if (!req.files) {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    if (!req.files["musicFile"] || !req.files["musicFile"][0]) {
      return res.status(400).json({
        message: "Music file is required",
      });
    }

    if (!req.files["coverImage"] || !req.files["coverImage"][0]) {
      return res.status(400).json({
        message: "Cover image is required",
      });
    }

    const musicFile = req.files["musicFile"][0];
    const coverImageFile = req.files["coverImage"][0];

    const { key: musicKey } = await uploadFile(musicFile);
    const { key: coverImageKey } = await uploadFile(coverImageFile);

    const music = await musicModel.create({
      title: req.body.title,
      artist: req.user.fullName.firstName + " " + req.user.fullName.lastName,
      artistId: req.user.id,
      musicKey,
      coverImageKey,
    });

    return res.status(201).json({
      message: "Music uploaded successfully",
      music,
    });
  } catch (error) {
    console.error("Error uploading music:", error);
    res.status(500).json({
      message: "Error uploading music",
      error: error.message,
    });
  }
}

export async function getArtistMusics(req, res) {
  try {
    const musicsDocs = await musicModel.find({ artistId: req.user.id }).lean();

    const musics = [];

    for (let music of musicsDocs) {
      music.musicUrl = await getPresignedUrl(music.musicKey);
      music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
      musics.push(music);
    }

    return res.status(200).json({
      message: "Artist musics fetched successfully",
      musics,
    });
  } catch (err) {
    console.error("Error fetching artist musics:", err);
    res.status(500).json({
      message: "Error fetching artist musics",
      error: err.message,
    });
  }
}

export async function createPlaylist(req, res) {
  const { title, musics = [], description = "", isPublic = true } = req.body;

  try {
    const payload = {
      title,
      userId: req.user.id,
      musics,
      description,
      isPublic,
    };

    // If the creator is an artist, also populate artist fields for backward compatibility
    if (req.user.role === "artist") {
      payload.artist = req.user.fullName.firstName + " " + req.user.fullName.lastName;
      payload.artistId = req.user.id;
    }

    const playlist = await playlistModel.create(payload);

    return res.status(201).json({
      message: "Playlist created successfully",
      playlist,
    });
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({
      message: "Error creating playlist",
      error: err.message,
    });
  }
}

export async function getPlaylists(req, res) {

  try {
    const playlistsDocs = await playlistModel.find({}).lean();

    const playlists = [];

    for(let playlist of playlistsDocs) {
      const musics = [];
      
      for(let musicId of playlist.musics) {
        const music = await musicModel.findById(musicId).lean();
        if (music) {
          music.musicUrl = await getPresignedUrl(music.musicKey);
          music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
          musics.push(music);
        }
      }
      
      playlist.musics = musics;
      playlists.push(playlist);
    }

    return res.status(200).json({
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (err) {
    console.error("Error fetching playlists:", err);
    res.status(500).json({
      message: "Error fetching playlists",
      error: err.message,
    });
  }
}

export async function getPlaylistById(req, res) {
  const { id } = req.params;

  try {
    const playlistDoc = await playlistModel.findById(id).lean();

    if (!playlistDoc) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    const musics = [];

    for (let musicId of playlistDoc.musics) {
      const music = await musicModel.findById(musicId).lean();
      if (music) {
        music.musicUrl = await getPresignedUrl(music.musicKey);
        music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
        musics.push(music);
      }
    }

    playlistDoc.musics = musics;

    return res.status(200).json({
      message: "Playlist fetched successfully",
      playlist: playlistDoc,
    });
  } catch (err) {
    console.error("Error fetching playlist by ID:", err);
    res.status(500).json({
      message: "Error fetching playlist by ID",
      error: err.message,
    });
  }
}

export async function getArtistPlaylists(req, res) {

  try {
    const playlistsDocs = await playlistModel.find({ artistId: req.user.id }).lean();

    const playlists = [];

    for(let playlist of playlistsDocs) {
      const musics = [];
      
      for(let musicId of playlist.musics) {
        const music = await musicModel.findById(musicId).lean();
        if (music) {
          music.musicUrl = await getPresignedUrl(music.musicKey);
          music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
          musics.push(music);
        }
      }
      
      playlist.musics = musics;
      playlists.push(playlist);
    }

    return res.status(200).json({
      message: "Artist playlists fetched successfully",
      playlists,
    });
  } catch (err) {
    console.error("Error fetching artist playlists:", err);
    res.status(500).json({
      message: "Error fetching artist playlists",
      error: err.message,
    });
  }
}

export async function getUserPlaylists(req, res) {
  try {
    const playlistsDocs = await playlistModel.find({ userId: req.user.id }).lean();

    const playlists = [];

    for (let playlist of playlistsDocs) {
      const musics = [];

      for (let musicId of playlist.musics) {
        const music = await musicModel.findById(musicId).lean();
        if (music) {
          music.musicUrl = await getPresignedUrl(music.musicKey);
          music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
          musics.push(music);
        }
      }

      playlist.musics = musics;
      playlists.push(playlist);
    }

    return res.status(200).json({
      message: "User playlists fetched successfully",
      playlists,
    });
  } catch (err) {
    console.error("Error fetching user playlists:", err);
    res.status(500).json({
      message: "Error fetching user playlists",
      error: err.message,
    });
  }
}

export async function searchMusic(req, res) {
  const { q, skip = 0, limit = 10 } = req.query;

  try {
    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    // Search by title or artist name (case-insensitive)
    const searchRegex = new RegExp(q, "i");
    const musicsDocs = await musicModel
      .find({
        $or: [
          { title: searchRegex },
          { artist: searchRegex }
        ]
      })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const musics = [];

    for (let music of musicsDocs) {
      music.musicUrl = await getPresignedUrl(music.musicKey);
      music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
      musics.push(music);
    }

    return res.status(200).json({
      message: "Search results fetched successfully",
      musics,
      count: musics.length,
    });
  } catch (err) {
    console.error("Error searching music:", err);
    res.status(500).json({
      message: "Error searching music",
      error: err.message,
    });
  }
}

export async function searchPlaylists(req, res) {
  const { q, skip = 0, limit = 10 } = req.query;

  try {
    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const musicsDocs = await musicModel
      .find({
        $or: [
          { title: new RegExp(q, "i") },
          { artist: new RegExp(q, "i") }
        ]
      })
      .lean();

    // Search by playlist title or artist name (case-insensitive)
    const searchRegex = new RegExp(q, "i");
    const playlistsDocs = await playlistModel
      .find({
        $or: [
          { title: searchRegex },
          { artist: searchRegex },
          { musics: { $in: musicsDocs.map(m => m._id) } }
        ]
      })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const playlists = [];

    for (let playlist of playlistsDocs) {
      const musics = [];
      
      for (let musicId of playlist.musics) {
        const music = await musicModel.findById(musicId).lean();
        if (music) {
          music.musicUrl = await getPresignedUrl(music.musicKey);
          music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
          musics.push(music);
        }
      }
      
      playlist.musics = musics;
      playlists.push(playlist);
    }

    return res.status(200).json({
      message: "Playlist search results fetched successfully",
      playlists,
      count: playlists.length,
    });
  } catch (err) {
    console.error("Error searching playlists:", err);
    res.status(500).json({
      message: "Error searching playlists",
      error: err.message,
    });
  }
}

export async function searchAll(req, res) {
  const { q, skip = 0, limit = 10 } = req.query;

  try {
    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(q, "i");

    // Search music
    const musicsDocs = await musicModel
      .find({
        $or: [
          { title: searchRegex },
          { artist: searchRegex }
        ]
      })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const musics = [];
    for (let music of musicsDocs) {
      music.musicUrl = await getPresignedUrl(music.musicKey);
      music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
      musics.push(music);
    }

    // Search playlists
    const playlistsDocs = await playlistModel
      .find({
        $or: [
          { title: searchRegex },
          { artist: searchRegex },
          { musics: { $in: musicsDocs.map(m => m._id) } }
        ]
      })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const playlists = [];
    for (let playlist of playlistsDocs) {
      const musics = [];
      
      for (let musicId of playlist.musics) {
        const music = await musicModel.findById(musicId).lean();
        if (music) {
          music.musicUrl = await getPresignedUrl(music.musicKey);
          music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
          musics.push(music);
        }
      }
      
      playlist.musics = musics;
      playlists.push(playlist);
    }

    return res.status(200).json({
      message: "Search results fetched successfully",
      results: {
        musics,
        playlists,
      },
      count: {
        musics: musics.length,
        playlists: playlists.length,
        total: musics.length + playlists.length,
      },
    });
  } catch (err) {
    console.error("Error searching:", err);
    res.status(500).json({
      message: "Error searching",
      error: err.message,
    });
  }
}

// ---------------- PLAY ACTIVITY & STREAK -----------------
// Log a play of a music track for the authenticated user.
// POST /api/music/play/:id
export async function logPlay(req, res) {
  try {
    const { id } = req.params;
    const { duration, deviceId } = req.body; // Optional fields
    
    // Validate music existence (optional short-circuit for bad IDs)
    const music = await musicModel.findById(id).lean();
    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }

    const userId = req.user.id;
    const now = new Date();
    const day = now.toISOString().slice(0,10); // YYYY-MM-DD

    // Update daily activity for streak calculation
    const activity = await playActivityModel.findOneAndUpdate(
      { userId, day },
      { $inc: { plays: 1 }, $set: { lastPlayAt: now } },
      { new: true, upsert: true }
    ).lean();

    // Save individual play event to history
    const historyEntry = await playHistoryModel.create({
      userId,
      musicId: id,
      playedAt: now,
      duration: duration || 0,
      deviceId: deviceId || null,
    });

    return res.status(200).json({
      message: 'Play logged',
      activity: {
        day: activity.day,
        plays: activity.plays,
        lastPlayAt: activity.lastPlayAt,
      },
      historyId: historyEntry._id,
    });
  } catch (err) {
    console.error('Error logging play:', err);
    return res.status(500).json({ message: 'Error logging play', error: err.message });
  }
}

// Get current streak for authenticated user
// GET /api/music/streak
export async function getStreak(req, res) {
  try {
    const userId = req.user.id;
    // Fetch last N days of activity (limit to avoid large scans)
    const daysToCheck = 30;
    const today = new Date();
    const startDate = new Date(today.getTime() - (daysToCheck - 1) * 86400000);
    const startDayStr = startDate.toISOString().slice(0,10);

    const activities = await playActivityModel.find({
      userId,
      day: { $gte: startDayStr },
    }).lean();

    const activitySet = new Set(activities.map(a => a.day));

    let streak = 0;
    for (let i = 0; i < daysToCheck; i++) {
      const d = new Date(today.getTime() - i * 86400000).toISOString().slice(0,10);
      if (activitySet.has(d)) streak++;
      else break;
    }

    return res.status(200).json({
      message: 'Streak fetched',
      streak,
      daysConsidered: daysToCheck,
      hasActivityToday: activitySet.has(today.toISOString().slice(0,10)),
    });
  } catch (err) {
    console.error('Error fetching streak:', err);
    return res.status(500).json({ message: 'Error fetching streak', error: err.message });
  }
}

// Get play history for authenticated user
// GET /api/music/history?limit=50&skip=0
export async function getPlayHistory(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit), 200); // Cap at 200
    const skipNum = parseInt(skip) || 0;

    // Fetch history entries sorted by most recent first
    const historyEntries = await playHistoryModel
      .find({ userId })
      .sort({ playedAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    // Populate music details with presigned URLs
    const history = [];
    for (let entry of historyEntries) {
      const music = await musicModel.findById(entry.musicId).lean();
      if (music) {
        music.musicUrl = await getPresignedUrl(music.musicKey);
        music.coverImageUrl = await getPresignedUrl(music.coverImageKey);
        history.push({
          ...entry,
          music,
        });
      }
    }

    // Get total count for pagination
    const totalCount = await playHistoryModel.countDocuments({ userId });

    return res.status(200).json({
      message: 'Play history fetched',
      history,
      pagination: {
        total: totalCount,
        limit: limitNum,
        skip: skipNum,
        hasMore: skipNum + history.length < totalCount,
      },
    });
  } catch (err) {
    console.error('Error fetching play history:', err);
    return res.status(500).json({ message: 'Error fetching play history', error: err.message });
  }
}