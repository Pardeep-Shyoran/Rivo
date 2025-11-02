import { uploadFile } from "../services/storage.service.js";
import musicModel from "../models/music.model.js";

export async function uploadMusic(req, res) {
  const musicFile = req.files["musicFile"][0];
  const coverImageFile = req.files["coverImage"][0];

  try {
    const { key: musicKey } = await uploadFile(musicFile);
    const { key: coverImageKey } = await uploadFile(coverImageFile);

    const music = await musicModel.create({
        title: req.body.title,
        artist: req.user.fullName.firstName + ' ' + req.user.fullName.lastName,
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
