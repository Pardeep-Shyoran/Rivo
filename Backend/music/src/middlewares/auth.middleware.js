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
  
  // Debug logging for production troubleshooting
  console.log('[AUTH DEBUG] Cookie token:', token ? 'present' : 'missing');
  console.log('[AUTH DEBUG] Authorization header:', authHeader ? 'present' : 'missing');
  console.log('[AUTH DEBUG] All cookies:', Object.keys(req.cookies));
  console.log('[AUTH DEBUG] Origin:', req.headers.origin);
  
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
    console.log('[AUTH DEBUG] Using Bearer token from header');
  }

  if (!token) {
    console.log('[AUTH DEBUG] No token found - returning 401');
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    console.log('[AUTH DEBUG] Token verified successfully for user:', decoded.id);
    next();
  } catch (err) {
    console.log('[AUTH DEBUG] Token verification failed:', err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
}