import express from 'express';
import multer from 'multer';
import * as musicController from '../controllers/music.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';


const upload = multer({
    storage: multer.memoryStorage(),
})


const router = express.Router();



router.post('/upload', authMiddleware.authArtistMiddleware, upload.fields([
    {name: 'musicFile', maxCount: 1},
    {name: 'coverImage', maxCount: 1}
]), musicController.uploadMusic)



export default router;