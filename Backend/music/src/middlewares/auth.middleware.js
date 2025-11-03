import jwt from "jsonwebtoken";
import config from "../config/config.js";

export async function authArtistMiddleware(req, res, next) {
  const token = req.cookies.token;

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
