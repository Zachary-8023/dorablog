import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  getAllArticles,
  getArticleById,
  getArticlesByUserId,
  getLikedUsers,
  searchArticles,
  toggleArticleLike,
  createArticle,
  getRecommendedArticles,
  getAllTags,
  getLikedArticlesByUser
} from "../../data/articles-dao.js";
import multer from "multer";
import path from "path";
import fs from "fs";
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "article-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

/**
 * Sending a GET request to /api/articles/ will return an array of all articles in the system.
 * Optionally filter by tag using query parameter: ?tag=Technology
 */
router.get("/", async (req, res) => {
  try {
    const tag = req.query.tag || null;
    const articles = await getAllArticles(tag);
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error getting articles:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a GET request to /api/articles/tags will return all unique tags with their usage count
 */
router.get("/tags", async (req, res) => {
  try {
    const tags = await getAllTags();
    return res.status(200).json(tags);
  } catch (error) {
    console.error("Error getting tags:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get all articles liked by the current user
 * Requires authentication
 */
router.get("/liked", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const articles = await getLikedArticlesByUser(userId);
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error getting liked articles:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/** * Sending a GET request to /api/articles/user/:id will return all articles created by the user with the given id.
 */
router.get("/user/:id", (req, res) => {
  getArticlesByUserId(req.params.id).then((articles) => {
    return res.status(200).json(articles);
  });
});

/** * Sending a GET request to /api/articles/search?keyword= will return all articles that match the given keyword.
 */
router.get("/search", (req, res) => {
  const keyword = req.query.keyword || req.body.keyword;
  searchArticles(keyword).then((articles) => {
    return res.status(200).json(articles);
  });
});

/**
 * Sending a POST request to /api/articles/like/:id will like or unlike the article with the given id.
 * Requires authentication.
 */
router.post("/like/:id", requireAuth, async (req, res) => {
  const articleId = req.params.id;
  const userId = req.user.id; // Get from authenticated user

  try {
    const result = await toggleArticleLike(articleId, userId);

    // Get updated like count
    const article = await getArticleById(articleId);

    return res.status(200).json({
      liked: result.liked,
      likeCount: article.likeCount || 0
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a GET request to /api/articles/:id/liked will check if the current user has liked the article.
 * Requires authentication - must be logged in.
 */
router.get("/:id/liked", requireAuth, async (req, res) => {
  const articleId = req.params.id;
  const userId = req.user.id;

  try {
    const db = await import("../../data/database.js").then((m) => m.getDatabase());
    const result = await db.get(
      "SELECT 1 FROM ArticleLike WHERE articleId = ? AND userId = ?",
      articleId,
      userId
    );

    return res.status(200).json({ liked: !!result });
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a DELETE request to /api/articles/:id will delete an article and all related data.
 * Requires authentication and user must be the author or admin.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(articleId)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    const { getDatabase } = await import("../../data/database.js");
    const db = await getDatabase();

    const article = await db.get("SELECT userId FROM Articles WHERE id = ?", articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (article.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "You don't have permission to delete this article" });
    }

    await db.run("DELETE FROM Comments WHERE articleId = ?", articleId);
    await db.run("DELETE FROM ArticleLike WHERE articleId = ?", articleId);
    await db.run("DELETE FROM ArticleTag WHERE articleId = ?", articleId);
    await db.run("DELETE FROM ArticleImg WHERE articleId = ?", articleId);
    await db.run("DELETE FROM Articles WHERE id = ?", articleId);

    return res.status(200).json({
      message: "Article deleted successfully",
      articleId: articleId
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a GET request to /api/articles/:id will return the article with the given id.
 */
router.get("/:id", (req, res) => {
  getArticleById(req.params.id).then((article) => {
    if (article) {
      return res.status(200).json(article);
    } else {
      return res.status(404).json({ message: "Article not found" });
    }
  });
});

/**
 * Sending a POST request to /api/articles/ will create a new article.
 * Requires user authentication.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, content, tag, headerImage, contentImages } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Validate content length
    if (title.length > 200) {
      return res.status(400).json({ error: "Title must be less than 200 characters" });
    }

    if (content.length > 100000) {
      return res.status(400).json({ error: "Content must be less than 100,000 characters" });
    }

    const articleData = {
      title: title.trim(),
      content: content.trim(),
      userId: userId,
      headerUrl: headerImage || null,
      tag: tag || null,
      contentImages: contentImages || []
    };

    // Create the article
    const createdArticle = await createArticle(articleData);

    return res.status(201).json({
      message: "Article created successfully",
      article: createdArticle
    });
  } catch (error) {
    console.error("Error creating article:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Sending a PUT request to /api/articles/:id will update an existing article.
 * Requires authentication and user must be the author or admin.
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { content, contentImages } = req.body;
    const userId = req.user.id;

    if (isNaN(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const { getDatabase } = await import("../../data/database.js");
    const db = await getDatabase();

    const article = await db.get("SELECT userId FROM Articles WHERE id = ?", articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (article.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "You don't have permission to edit this article" });
    }

    await db.run("UPDATE Articles SET content = ? WHERE id = ?", [content.trim(), articleId]);
    await db.run("DELETE FROM ArticleImg WHERE articleId = ?", articleId);

    if (contentImages && contentImages.length > 0) {
      for (const imageUrl of contentImages) {
        await db.run("INSERT INTO ArticleImg (articleId, imgUrl) VALUES (?, ?)", [
          articleId,
          imageUrl
        ]);
      }
    }

    return res.status(200).json({
      message: "Article updated successfully"
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a GET request to /api/articles/:id/recommendations will return recommended articles for the given article.
 */
router.get("/:id/recommendations", async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 5;

    if (isNaN(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const recommendations = await getRecommendedArticles(articleId, limit);
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `/uploads/articles/${req.file.filename}`;

    res.json({
      location: imageUrl,
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error("Article image upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
