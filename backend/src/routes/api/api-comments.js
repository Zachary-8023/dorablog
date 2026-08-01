import express from "express";
import {
  getCommentsByArticleId,
  createComment,
  getCommentById,
  updateComment,
  deleteComment
} from "../../data/comments-dao.js";
import { buildNestedComments } from "../../utils/comments-utils.js";
import { getUserWithUserId } from "../../data/users-dao.js";
import { requireAuth } from "../../middleware/auth.js";
import { getArticleById } from "../../data/articles-dao.js";

const router = express.Router();

/**
 * Get all comments for a specific article
 * @param {number} articleId - The ID of the article to get comments for
 * @returns {Promise<Comment[]>} A promise that resolves to an array of comments with nested childrenComments
 */
router.get("/articles/:id", async (req, res) => {
  const articleId = req.params.id;
  const comments = await getCommentsByArticleId(articleId);

  // Build the comments tree with proper depth calculation and sorting
  for (const comment of comments) {
    const user = await getUserWithUserId(comment.userId);
    comment.username = user ? user.username : null;
    comment.isAdmin = user ? user.isAdmin : false;
    comment.avatarUrl = user ? user.avatarUrl : null;
  }

  // Build nested structure instead of flat structure
  const nestedComments = buildNestedComments(comments);
  return res.status(200).json(nestedComments);
});

/**
 * Create a new comment for an article or reply to an existing comment
 * @param {Object} req.body - The comment data
 * @param {string} req.body.content - The comment content
 * @param {number} req.body.articleId - The article ID
 * @param {number} [req.body.parentCommentId] - The parent comment ID (for replies)
 * @returns {Promise<Comment>} A promise that resolves to the created comment
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { content, articleId, parentCommentId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!content || !articleId) {
      return res.status(400).json({ error: "Content and articleId are required" });
    }

    // Create the comment
    const comment = await createComment({
      content,
      articleId: parseInt(articleId),
      userId,
      parentCommentId: parentCommentId ? parseInt(parentCommentId) : null
    });

    // Get user info for the response
    comment.username = req.user.username;
    comment.isAdmin = req.user.isAdmin;
    comment.avatarUrl = req.user.avatarUrl;

    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Update a comment
 * @param {Object} req.body - The comment data
 * @param {string} req.body.content - The updated comment content
 * @returns {Promise<Comment>} A promise that resolves to the updated comment
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Check if comment exists and user has permission
    const existingComment = await getCommentById(commentId);
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user is author or admin
    if (existingComment.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized to edit this comment" });
    }

    // Update the comment
    const updatedComment = await updateComment(commentId, { content });

    // Get user info for the response
    updatedComment.username = req.user.username;
    updatedComment.isAdmin = req.user.isAdmin;
    updatedComment.avatarUrl = req.user.avatarUrl;

    return res.status(200).json(updatedComment);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Delete a comment
 * @param {number} commentId - The ID of the comment to delete
 * @returns {Promise<Object>} A promise that resolves to a success message
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if comment exists and user has permission
    const existingComment = await getCommentById(commentId);
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const article = await getArticleById(existingComment.articleId);

    // Check if user is author or admin
    if (existingComment.userId !== userId && article.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    // Delete the comment
    await deleteComment(commentId);

    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
