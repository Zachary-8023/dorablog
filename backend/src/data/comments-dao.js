import { getDatabase } from "./database.js";

/**
 * Gets the comments belong to certain article in the database.
 *
 * @param {number} articleId the article id
 *
 * @returns array of comment objects
 */
export async function getCommentsByArticleId(articleId) {
  const db = await getDatabase();
  const comments = await db.all(
    "SELECT * FROM Comments WHERE articleId = ? ORDER BY date ASC",
    articleId
  );
  return comments;
}

/**
 * Creates a new comment in the database.
 *
 * @param {Object} commentData - The comment data
 * @param {string} commentData.content - The comment content
 * @param {number} commentData.articleId - The article ID
 * @param {number} commentData.userId - The user ID
 * @param {number} [commentData.parentCommentId] - The parent comment ID (for replies)
 *
 * @returns {Promise<Object>} The created comment object
 */
export async function createComment(commentData) {
  const db = await getDatabase();
  const { content, articleId, userId, parentCommentId } = commentData;

  // Get current time in New Zealand timezone
  const now = new Date();
  const nzTimeString = now
    .toLocaleString("sv-SE", { timeZone: "Pacific/Auckland" })
    .replace("T", " ");

  const result = await db.run(
    "INSERT INTO Comments (content, articleId, userId, parentCommentId, date) VALUES (?, ?, ?, ?, ?)",
    [content, articleId, userId, parentCommentId, nzTimeString]
  );

  // Get the created comment
  const comment = await db.get("SELECT * FROM Comments WHERE id = ?", result.lastID);

  return comment;
}

/**
 * Gets a comment by its ID.
 *
 * @param {number} commentId - The comment ID
 *
 * @returns {Promise<Object|null>} The comment object or null if not found
 */
export async function getCommentById(commentId) {
  const db = await getDatabase();
  const comment = await db.get("SELECT * FROM Comments WHERE id = ?", commentId);
  return comment;
}

/**
 * Updates a comment in the database.
 *
 * @param {number} commentId - The comment ID
 * @param {Object} updateData - The update data
 * @param {string} updateData.content - The updated content
 *
 * @returns {Promise<Object>} The updated comment object
 */
export async function updateComment(commentId, updateData) {
  const db = await getDatabase();
  const { content } = updateData;

  await db.run("UPDATE Comments SET content = ? WHERE id = ?", [content, commentId]);

  // Get the updated comment
  const comment = await db.get("SELECT * FROM Comments WHERE id = ?", commentId);

  return comment;
}

/**
 * Deletes a comment from the database.
 *
 * @param {number} commentId - The comment ID
 *
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
  const db = await getDatabase();
  await db.run("DELETE FROM Comments WHERE id = ?", commentId);
}
