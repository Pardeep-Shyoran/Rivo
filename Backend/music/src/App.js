import express from "express";
import musicRoutes from "./routes/music.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config.js";

const App = express();

// Simplified CORS: single explicit origin (frontend), credentials enabled.
// Authorization header removed since we rely solely on httpOnly cookies.
App.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

console.log("[CORS] music origin:", config.FRONTEND_URL || "<none>");

App.use(cookieParser());
App.use(express.json());

App.use("/api/music", musicRoutes);

export default App;
