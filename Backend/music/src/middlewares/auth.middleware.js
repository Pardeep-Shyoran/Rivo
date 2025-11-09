import jwt from "jsonwebtoken";
import config from "../config/config.js";

// NOTE: Cookie-only authentication. We intentionally removed the Authorization header
// fallback to simplify the system per requirement. All clients must send the
// httpOnly "token" cookie set by the auth service. No Bearer headers accepted.

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
    console.log('[AUTH]', err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function authUserMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('[AUTH]', err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
}