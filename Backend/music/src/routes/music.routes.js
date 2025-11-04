import express from "express";
import multer from "multer";
import * as musicController from "../controllers/music.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

// Get all music tracks (route for authenticated users)
// GET /api/music/
router.get(
  "/",
  authMiddleware.authUserMiddleware,
  musicController.getAllMusics
);


router.get('/get-details/:id', authMiddleware.authUserMiddleware, musicController.getMusicById);

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
// GET /api/music/artist-musics
router.get(
  "/artist-musics",
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

// Get all playlists (route for authenticated users)
// GET /api/music/playlists
router.get(
  "/playlist",
  authMiddleware.authUserMiddleware,
  musicController.getPlaylists
);

// Get a specific playlist by ID (route for authenticated users)
// GET /api/music/playlist/:id
router.get(
  "/playlist/:id",
  authMiddleware.authUserMiddleware,
  musicController.getPlaylistById
);

export default router;
