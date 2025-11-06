import jwt from "jsonwebtoken";
import config from "../config/config.js";

export async function authArtistMiddleware(req, res, next) {
  let token = req.cookies.token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    if (decoded.role !== "artist") {
      return res.status(403).json({ message: "Forbidden: Artists only" });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function authUserMiddleware(req, res, next) {
  let token = req.cookies.token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}