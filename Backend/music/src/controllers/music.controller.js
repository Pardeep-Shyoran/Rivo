import { uploadFile, getPresignedUrl } from "../services/storage.service.js";
import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";


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
  const { title, musics } = req.body;

  try {
    const playlist = await playlistModel.create({
      artist: req.user.fullName.firstName + " " + req.user.fullName.lastName,
      artistId: req.user.id,
      title,
      userId: req.user.id,
      musics,
    });

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