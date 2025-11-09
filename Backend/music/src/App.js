import express from "express";
import musicRoutes from "./routes/music.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config.js";

const App = express();

// Robust CORS configuration to support prod, previews, and local dev
const whitelist = [config.FRONTEND_URL].filter(Boolean);
const allowedPatterns = [
  /^https?:\/\/localhost:\d+$/,
  /^https?:\/\/127\.0\.0\.1:\d+$/,
  /\.vercel\.app$/,
];

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (no Origin header)
    if (!origin) return callback(null, true);

    const isWhitelisted =
      whitelist.includes(origin) || allowedPatterns.some((re) => re.test(origin));

    if (isWhitelisted) return callback(null, true);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 204,
};

App.use(cors(corsOptions));

// Startup debug (safe): show configured FRONTEND_URL
console.log("[CORS] music allowed origin:", config.FRONTEND_URL || "<none>");

App.use(cookieParser());
App.use(express.json());

App.use("/api/music", musicRoutes);

export default App;
