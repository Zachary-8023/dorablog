import { getDatabase } from "./database.js";

/**
 * Gets all articles in the database with user information.
 * Optionally filters by tag.
 * 
 * @param {string} tag - Optional tag to filter articles by
 * @returns array of article objects with user data
 */
export async function getAllArticles(tag = null) {
  const db = await getDatabase();
  
  let query = `
    SELECT 
      Articles.*,
      Users.username as authorUsername,
      Users.realname as authorRealName,
      Users.avatarUrl as authorAvatar,
      IFNULL(like_stats.likeCount, 0) as likeCount,
      IFNULL(comment_stats.commentCount, 0) as commentCount
    FROM Articles 
    LEFT JOIN Users ON Articles.userId = Users.id 
    LEFT JOIN (
      SELECT articleId, COUNT(*) as likeCount 
      FROM ArticleLike 
      GROUP BY articleId
    ) like_stats ON Articles.id = like_stats.articleId
    LEFT JOIN (
      SELECT articleId, COUNT(*) as commentCount 
      FROM Comments 
      GROUP BY articleId
    ) comment_stats ON Articles.id = comment_stats.articleId
  `;
  
  const params = [];
  
  // If tag is specified, add JOIN and WHERE clause
  if (tag) {
    query += `
    INNER JOIN ArticleTag ON Articles.id = ArticleTag.articleId
    WHERE ArticleTag.tag = ?
    `;
    params.push(tag);
  }
  
  query += ` ORDER BY Articles.date DESC`;
  
  const articles = await db.all(query, ...params);
  
  // Ensure commentCount is never null
  articles.forEach(article => {
    article.commentCount = article.commentCount || 0;
  });
  
  return articles;
}

/**
 * Gets the article with the given articleId, if it exists.
 * Includes author information, content images, and like count.
 * @param {number} articleId the article id
 * @returns article object if found, null otherwise
 */
export async function getArticleById(articleId) {
  const db = await getDatabase();
  
  // Get article with author information
  const article = await db.get(`
    SELECT 
      Articles.*,
      Users.username as authorUsername,
      Users.realname as authorRealname,
      Users.avatarUrl as authorAvatar
    FROM Articles
    LEFT JOIN Users ON Articles.userId = Users.id
    WHERE Articles.id = ?
  `, articleId);
  
  if (!article) {
    return null;
  }
  
  // Get content images for this article
  const images = await db.all(
    "SELECT imgUrl FROM ArticleImg WHERE articleId = ?",
    articleId
  );
  article.images = images.map(img => img.imgUrl);
  
  // Get like count
  const likeCount = await db.get(
    "SELECT COUNT(*) as count FROM ArticleLike WHERE articleId = ?",
    articleId
  );
  article.likeCount = likeCount.count;
  
  // Get tags for this article
  const tags = await db.all(
    "SELECT tag, color FROM ArticleTag WHERE articleId = ?",
    articleId
  );
  article.tags = tags;
  
  return article;
}

/**
 * Gets all articles written by the user with the given userId.
 * @param {number} userId the user id
 * @returns array of article objects
 */
export async function getArticlesByUserId(userId) {
  const db = await getDatabase();
  const articles = await db.all(`
    SELECT 
      Articles.*,
      Users.username as authorUsername,
      Users.realname as authorRealName,
      Users.avatarUrl as authorAvatar,
      IFNULL(like_stats.likeCount, 0) as likeCount,
      IFNULL(comment_stats.commentCount, 0) as commentCount
    FROM Articles 
    LEFT JOIN Users ON Articles.userId = Users.id 
    LEFT JOIN (
      SELECT articleId, COUNT(*) as likeCount 
      FROM ArticleLike 
      GROUP BY articleId
    ) like_stats ON Articles.id = like_stats.articleId
    LEFT JOIN (
      SELECT articleId, COUNT(*) as commentCount 
      FROM Comments 
      GROUP BY articleId
    ) comment_stats ON Articles.id = comment_stats.articleId
    WHERE Articles.userId = ?
    ORDER BY Articles.date DESC
  `, userId);
  
  // Ensure commentCount is never null
  articles.forEach(article => {
    article.commentCount = article.commentCount || 0;
  });
  
  return articles;
}


/** * Searches articles based on the given keyword.
 * The search looks for matches in articleId, userId, title, content, and author's username.
 * @param {string|number} keyword the search keyword
 * @returns array of matching article objects
 */
export async function searchArticles(keyword) {
  const db = await getDatabase();
  const clauses = [];
  const values = [];

  const has = (v) => v !== undefined && v !== null && v !== "";

  // empty keyword -> return all articles
  if (!has(keyword)) {
    return await db.all("SELECT * FROM Articles");
  }

  // treat pure-digit keywords as potential articleId / userId matches
  const isNumeric = /^\d+$/.test(String(keyword));
  const likePattern = `%${keyword}%`;

  if (isNumeric) {
    clauses.push("Articles.id = ?");
    values.push(Number(keyword));
    clauses.push("Articles.userId = ?");
    values.push(Number(keyword));
  }

  // search title/content and author's username
  clauses.push("Articles.title LIKE ?");
  values.push(likePattern);
  clauses.push("Articles.content LIKE ?");
  values.push(likePattern);
  clauses.push("Users.username LIKE ?");
  values.push(likePattern);

  const sql = `
    SELECT 
      Articles.*,
      Users.username as authorUsername,
      Users.realname as authorRealName,
      Users.avatarUrl as authorAvatar,
      IFNULL(like_stats.likeCount, 0) as likeCount
    FROM Articles 
    LEFT JOIN Users ON Articles.userId = Users.id 
    LEFT JOIN (
      SELECT articleId, COUNT(*) as likeCount 
      FROM ArticleLike 
      GROUP BY articleId
    ) like_stats ON Articles.id = like_stats.articleId
    WHERE ${clauses.join(" OR ")}
  `;

  const articles = await db.all(sql, ...values);
  return articles;
}


/**
 * Gets all users who liked the article with the given articleId.
 * @param {number} articleId the article id
 * @returns array of user objects who liked the article
 */
export async function getLikedUsers(articleId) {
  const db = await getDatabase();
  const likedUsers = await db.all("SELECT * FROM ArticleLike WHERE articleId = ?", articleId);
  return likedUsers;
}

/**
 * Toggle like for an article by a user.
 * If the user already liked the article the row is deleted (unlike).
 * If the user hasn't liked the article the row is inserted (like).
 *
 * @param {number} articleId
 * @param {number} userId
 * @returns {Object} { liked: boolean, changes: number | null }
 */
export async function toggleArticleLike(articleId, userId) {
  const db = await getDatabase();

  if (articleId === undefined || userId === undefined) {
    throw new Error("articleId and userId are required");
  }

  const aid = Number(articleId);
  const uid = Number(userId);
  if (Number.isNaN(aid) || Number.isNaN(uid)) {
    throw new Error("articleId and userId must be numbers");
  }

  // check existing like
  const existing = await db.get(
    "SELECT 1 FROM ArticleLike WHERE articleId = ? AND userId = ?",
    aid,
    uid
  );

  if (existing) {
    // unlike -> remove row
    const res = await db.run(
      "DELETE FROM ArticleLike WHERE articleId = ? AND userId = ?",
      aid,
      uid
    );
    return { liked: false, changes: res.changes ?? null };
  } else {
    // like -> insert row
    const res = await db.run(
      "INSERT INTO ArticleLike (articleId, userId) VALUES (?, ?)",
      aid,
      uid
    );
    return { liked: true, changes: res.changes ?? null };
  }
}

/**
 * Creates a new article in the database.
 * @param {Object} articleData - The article data
 * @param {string} articleData.title - The article title
 * @param {string} articleData.content - The article content
 * @param {number} articleData.userId - The user ID who created the article
 * @param {string} articleData.headerUrl - The header image URL (optional)
 * @param {string} articleData.tag - The article tag
 * @returns {Object} The created article object
 */
export async function createArticle(articleData) {
  const db = await getDatabase();
  const { title, content, userId, headerUrl, tag, contentImages } = articleData;
  
  if (!title || !content || !userId) {
    throw new Error("Title, content, and userId are required");
  }
  
  // Get current time in New Zealand timezone
  const now = new Date();
  const nzTimeString = now.toLocaleString("sv-SE", {timeZone: "Pacific/Auckland"}).replace('T', ' ');
  
  // Insert the article
  const result = await db.run(
    `INSERT INTO Articles (title, content, userId, headerUrl, date) 
     VALUES (?, ?, ?, ?, ?)`,
    [title, content, userId, headerUrl || null, nzTimeString]
  );
  
  const articleId = result.lastID;
  
  // Add tag if provided
  if (tag) {
    await db.run(
      "INSERT INTO ArticleTag (articleId, tag, color) VALUES (?, ?, ?)",
      [articleId, tag, getTagColor(tag)]
    );
  }
  
  // Add content images if provided
  if (contentImages && contentImages.length > 0) {
    for (const imageUrl of contentImages) {
      await db.run(
        "INSERT INTO ArticleImg (articleId, imgUrl) VALUES (?, ?)",
        [articleId, imageUrl]
      );
    }
  }
  
  // Return the created article
  const createdArticle = await getArticleById(articleId);
  return createdArticle;
}

/**
 * Gets recommended articles for a given article
 * Recommendation logic: Same Tag (by latest date) → Higher Popularity
 * @param {number} articleId - The article ID to get recommendations for
 * @param {number} limit - Maximum number of recommendations (default: 5)
 * @returns {Array} Array of recommended article objects
 */
export async function getRecommendedArticles(articleId, limit = 5) {
  const db = await getDatabase();
  
  // Get current article info
  const currentArticle = await getArticleById(articleId);
  if (!currentArticle) {
    return [];
  }
  
  // Get current article's tags
  const currentTags = currentArticle.tags.map(tag => tag.tag);
  
  let recommendations = [];
  
  // Step 1: Same Tag Priority (sorted by latest date)
  if (currentTags.length > 0) {
    const sameTagArticles = await db.all(`
      SELECT DISTINCT a.*, u.username as authorUsername, u.realname as authorRealName, u.avatarUrl as authorAvatar,
             IFNULL(like_stats.likeCount, 0) as likeCount,
             IFNULL(comment_stats.commentCount, 0) as commentCount,
             (IFNULL(like_stats.likeCount, 0) * 1.0 + IFNULL(comment_stats.commentCount, 0) * 2.0) as popularityScore
      FROM Articles a
      LEFT JOIN Users u ON a.userId = u.id
      LEFT JOIN ArticleTag at ON a.id = at.articleId
      LEFT JOIN (
        SELECT articleId, COUNT(*) as likeCount 
        FROM ArticleLike 
        GROUP BY articleId
      ) like_stats ON a.id = like_stats.articleId
      LEFT JOIN (
        SELECT articleId, COUNT(*) as commentCount 
        FROM Comments 
        GROUP BY articleId
      ) comment_stats ON a.id = comment_stats.articleId
      WHERE a.id != ? 
        AND at.tag IN (${currentTags.map(() => '?').join(',')})
      ORDER BY a.date DESC
    `, [articleId, ...currentTags]);
    
    // Ensure commentCount and popularityScore are never null
    sameTagArticles.forEach(article => {
      article.commentCount = article.commentCount || 0;
      article.popularityScore = article.popularityScore || 0;
    });
    
    recommendations = sameTagArticles.slice(0, limit);
  }
  
  // Step 2: Popularity Priority (if still not enough)
  if (recommendations.length < limit) {
    const popularArticles = await db.all(`
      SELECT a.*, u.username as authorUsername, u.realname as authorRealName, u.avatarUrl as authorAvatar,
             IFNULL(like_stats.likeCount, 0) as likeCount,
             IFNULL(comment_stats.commentCount, 0) as commentCount,
             (IFNULL(like_stats.likeCount, 0) * 1.0 + IFNULL(comment_stats.commentCount, 0) * 2.0) as popularityScore
      FROM Articles a
      LEFT JOIN Users u ON a.userId = u.id
      LEFT JOIN (
        SELECT articleId, COUNT(*) as likeCount 
        FROM ArticleLike 
        GROUP BY articleId
      ) like_stats ON a.id = like_stats.articleId
      LEFT JOIN (
        SELECT articleId, COUNT(*) as commentCount 
        FROM Comments 
        GROUP BY articleId
      ) comment_stats ON a.id = comment_stats.articleId
      WHERE a.id != ?
      ORDER BY popularityScore DESC, a.date DESC
    `, [articleId]);
    
    // Add to recommendations if not already included
    for (let article of popularArticles) {
      // Ensure commentCount and popularityScore are never null
      article.commentCount = article.commentCount || 0;
      article.popularityScore = article.popularityScore || 0;
      
      if (!recommendations.find(rec => rec.id === article.id)) {
        recommendations.push(article);
      }
    }
  }
  
  // Remove duplicates and limit results
  const uniqueRecommendations = recommendations.filter((article, index, self) => 
    index === self.findIndex(a => a.id === article.id)
  );
  
  // Add tags to each recommendation
  for (let article of uniqueRecommendations) {
    const tags = await db.all(
      "SELECT tag, color FROM ArticleTag WHERE articleId = ?",
      article.id
    );
    article.tags = tags;
  }
  
  return uniqueRecommendations.slice(0, limit);
}

/**
 * Gets the color for a tag (simple color assignment)
 * 只包含新建文章页定义的6个标签
 * @param {string} tag - The tag name
 * @returns {string} The color for the tag
 */
function getTagColor(tag) {
  const colors = {
    'Technology': 'blue',
    'Lifestyle': 'green', 
    'Travel': 'orange',
    'Health': 'red',
    'Entertainment': 'pink',
    'News': 'gray'
  };
  return colors[tag] || 'gray';
}

/**
 * Gets all unique tags used in articles
 * @returns {Promise<Array<{tag: string, color: string, count: number}>>} Array of tag objects with their colors and usage count
 */
export async function getAllTags() {
  const db = await getDatabase();
  const tags = await db.all(`
    SELECT 
      tag, 
      color,
      COUNT(*) as count
    FROM ArticleTag 
    GROUP BY tag, color
    ORDER BY count DESC, tag ASC
  `);
  return tags;
}

/**
 * Gets all articles liked by a specific user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of articles liked by the user
 */
export async function getLikedArticlesByUser(userId) {
  const db = await getDatabase();
  const articles = await db.all(`
    SELECT 
      Articles.*,
      Users.username as authorUsername,
      Users.realname as authorRealName,
      Users.avatarUrl as authorAvatar,
      IFNULL(like_stats.likeCount, 0) as likeCount,
      IFNULL(comment_stats.commentCount, 0) as commentCount
    FROM Articles 
    INNER JOIN ArticleLike ON Articles.id = ArticleLike.articleId
    LEFT JOIN Users ON Articles.userId = Users.id 
    LEFT JOIN (
      SELECT articleId, COUNT(*) as likeCount 
      FROM ArticleLike 
      GROUP BY articleId
    ) like_stats ON Articles.id = like_stats.articleId
    LEFT JOIN (
      SELECT articleId, COUNT(*) as commentCount 
      FROM Comments 
      GROUP BY articleId
    ) comment_stats ON Articles.id = comment_stats.articleId
    WHERE ArticleLike.userId = ?
    ORDER BY Articles.date DESC
  `, userId);
  
  // Ensure commentCount is never null
  articles.forEach(article => {
    article.commentCount = article.commentCount || 0;
  });
  
  return articles;
}

