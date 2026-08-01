import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDatabase } from "../../data/database.js";
import { requireAuth } from "../../middleware/auth.js";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../../utils/password-utils.js";
import { createImageUpload, persistUploadedImage } from '../../utils/image-storage.js';

const router = Router();

const upload = createImageUpload({
  directory: "avatars",
  prefix: "avatar",
  maxSize: 2 * 1024 * 1024
});

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 3600 * 1000,
    secure: Boolean(process.env.VERCEL || process.env.NODE_ENV === "production")
  });
}

/** POST /api/auth/register  body: { username, password, confirm, realname?, birthdate?, description?, avatar? } */
router.post("/register", async (req, res) => {
  console.log('Registration request received:', req.body);
  const { username, password, confirm, realname, birthdate, description, avatar } = req.body || {};
  
  if (!username || !password || !confirm) {
    console.log('Missing required fields:', { username: !!username, password: !!password, confirm: !!confirm });
    return res.status(400).json({ error: "Missing field" });
  }
  
  if (password !== confirm) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: "Password does not meet security requirements",
      details: passwordValidation.errors,
      suggestions: passwordValidation.suggestions
    });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long" });
  }
  if (username.length > 20) {
    return res.status(400).json({ error: "Username must be no more than 20 characters long" });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
  }
  
  try {
    console.log('Connecting to database...');
    const db = await getDatabase();
    console.log('Database connected successfully');
    const hash = await hashPassword(password);
    console.log('Password hashed successfully');
    
    console.log('Inserting user into database...');
    await db.run(
      `INSERT INTO Users (username, passwordHash, realname, birthdate, description, avatarUrl)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hash, realname || "", birthdate || "", description || "", avatar || ""]
    );
    
    console.log(`New user registered successfully: ${username}`);
    return res.status(201).json({ 
      message: "Registration successful",
      passwordStrength: passwordValidation.strength
    });
  } catch (e) {
    console.error('Registration error details:', e);
    if (String(e).includes("UNIQUE")) {
      return res.status(409).json({ error: "Username already taken" });
    }
    return res.status(500).json({ error: "Server error: " + e.message });
  }
});

/** GET /api/auth/registered?username=xxx → { registered: true/false } */
router.get("/registered", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });
  
  try {
    const db = await getDatabase();
    const row = await db.get("SELECT 1 FROM Users WHERE username = ?", [username]);
    return res.json({ registered: !!row });
  } catch (error) {
    console.error('Username check error:', error);
    return res.status(500).json({ error: "Server error" });
  }
});

/** POST /api/auth/login  body: { username, password } → set Cookie and return basic user */
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing field" });

  try {
    const db = await getDatabase();
    const user = await db.get(
      "SELECT id, username, passwordHash, admin FROM Users WHERE username = ?",
      [username]
    );
    
    if (!user) {
      console.log(`Login attempt with non-existent username: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      console.log(`Failed login attempt for user: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        admin: user.admin || false
      },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "7d" }
    );
    
    setAuthCookie(res, token);
    
    console.log(`Successful login for user: ${username}`);
    return res.json({ 
      message: "Login successful", 
      user: { 
        id: user.id, 
        username: user.username,
        admin: user.admin || false
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: "Server error" });
  }
});

/** POST /api/auth/logout → clear Cookie and return 204 */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.sendStatus(204);
});

/** GET /api/auth/userInfo → return current user */
router.get('/userInfo', requireAuth, async (req, res) => {
  console.log('userInfo hit, req.user =', req.user);
  res.set('Cache-Control', 'no-store');
  
  try {
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, username, realname, birthdate, admin, description, avatarUrl FROM Users WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log('User info for userInfo API:', user);
    console.log('Avatar URL from database:', user.avatarUrl);
    
    return res.json({ user });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/upload-avatar", upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadedImage = await persistUploadedImage(req.file, {
      directory: "avatars",
      prefix: "avatar"
    });
    const avatarUrl = uploadedImage.url;
    const db = await getDatabase();
    await db.run(
      `INSERT INTO Images (url) VALUES (?)`,
      [avatarUrl]
    );
    
    console.log('Avatar uploaded and saved to database:', uploadedImage.filename);
    res.json({ 
      success: true, 
      avatarUrl: avatarUrl,
      filename: uploadedImage.filename
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

export default router;



