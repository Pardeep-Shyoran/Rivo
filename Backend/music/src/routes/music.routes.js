import express from "express";
import multer from "multer";
import * as musicController from "../controllers/music.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as followController from "../controllers/follow.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

// Search across all content (route for authenticated users)
// GET /api/music/search?q=query
router.get(
  "/search",
  authMiddleware.authUserMiddleware,
  musicController.searchAll
);

// Search music tracks only (route for authenticated users)
// GET /api/music/search/music?q=query
router.get(
  "/search/music",
  authMiddleware.authUserMiddleware,
  musicController.searchMusic
);

// Search playlists only (route for authenticated users)
// GET /api/music/search/playlist?q=query
router.get(
  "/search/playlist",
  authMiddleware.authUserMiddleware,
  musicController.searchPlaylists
);

// Get all music tracks (route for authenticated users)
// GET /api/music/
router.get(
  "/",
  authMiddleware.authUserMiddleware,
  musicController.getAllMusics
);

// Get music details by ID (route for authenticated users)
// GET /api/music/get-details/:id
router.get(
  "/get-details/:id",
  authMiddleware.authUserMiddleware,
  musicController.getMusicById
);

// Get all playlists (route for authenticated users)
// GET /api/music/playlist
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

// Create a new playlist (route for any authenticated user)
// POST /api/music/playlist
router.post(
  "/playlist",
  authMiddleware.authUserMiddleware,
  musicController.createPlaylist
);

// Get all playlists created by the artist (route for artists only)
// GET /api/music/artist/playlist
router.get(
  "/artist/playlist",
  authMiddleware.authArtistMiddleware,
  musicController.getArtistPlaylists
);

// Get all playlists created by the authenticated user (listener or artist)
// GET /api/music/user/playlist
router.get(
  "/user/playlist",
  authMiddleware.authUserMiddleware,
  musicController.getUserPlaylists
);

// Log play (authenticated users)
// POST /api/music/play/:id
router.post(
  "/play/:id",
  authMiddleware.authUserMiddleware,
  musicController.logPlay
);

// Get streak (authenticated users)
// GET /api/music/streak
router.get(
  "/streak",
  authMiddleware.authUserMiddleware,
  musicController.getStreak
);

// Get play history (authenticated users)
// GET /api/music/history?limit=50&skip=0
router.get(
  "/history",
  authMiddleware.authUserMiddleware,
  musicController.getPlayHistory
);

// Follow system (authenticated users)
router.post(
  "/artists/:artistId/follow",
  authMiddleware.authUserMiddleware,
  followController.followArtist
);

router.delete(
  "/artists/:artistId/follow",
  authMiddleware.authUserMiddleware,
  followController.unfollowArtist
);

router.get(
  "/artists/:artistId/follow/status",
  authMiddleware.authUserMiddleware,
  followController.isFollowingArtist
);

router.get(
  "/artists/:artistId/followers/count",
  followController.getFollowersCount
);

router.get(
  "/me/following",
  authMiddleware.authUserMiddleware,
  followController.getMyFollowedArtists
);

export default router;
