import { uploadFile, getPresignedUrl } from "../services/storage.service.js";
import musicModel from "../models/music.model.js";

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
