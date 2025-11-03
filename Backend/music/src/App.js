import express from "express";
import musicRoutes from "./routes/music.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config/config.js";

const App = express();

App.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

App.use(cookieParser());
App.use(express.json());

App.use("/api/music", musicRoutes);

export default App;
