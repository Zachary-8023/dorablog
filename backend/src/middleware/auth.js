// auth middleware: read and verify JWT from cookies
import jwt from "jsonwebtoken";

// Login required: put { id, username } into req.user, otherwise return 401.

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Not log in" });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    req.user = payload; // { id, username }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}
