import express from "express";
import multer from "multer";
import * as musicController from "../controllers/music.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

// Get all music tracks (public)
// GET /api/music/
router.get("/", musicController.getAllMusics);

// Get music details by ID (public)
// GET /api/music/get-details/:id
router.get("/get-details/:id", musicController.getMusicById);

// Get all playlists (public)
// GET /api/music/playlist
router.get("/playlist", musicController.getPlaylists);

// Get a specific playlist by ID (public)
// GET /api/music/playlist/:id
router.get("/playlist/:id", musicController.getPlaylistById);

// Upload music file and cover image (route for artists only)
// POST /api/music/upload
router.post(
  "/upload",
  authMiddleware.authArtistMiddleware,
  upload.fields([
    { name: "musicFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  musicController.uploadMusic
);

// Get all music tracks (route for artists only)
// GET /api/music/artist/musics
router.get(
  "/artist/musics",
  authMiddleware.authArtistMiddleware,
  musicController.getArtistMusics
);

// Create a new playlist (route for artists only)
// POST /api/music/playlist
router.post(
  "/playlist",
  authMiddleware.authArtistMiddleware,
  musicController.createPlaylist
);

// Get all playlists created by the artist (route for artists only)
// GET /api/music/artist/playlist
router.get(
  "/artist/playlist",
  authMiddleware.authArtistMiddleware,
  musicController.getArtistPlaylists
);

export default router;
