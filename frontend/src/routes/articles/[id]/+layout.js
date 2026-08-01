// Disable server-side rendering cache for this page
import { API } from "$lib/api.js";
import defaultHeader from "../../../assets/images/article/header.png";

export const ssr = false;
// Disable prerendering
export const prerender = false;

// Load article data from database by ID
export const load = async ({ params, fetch }) => {
  console.log("Loading article with ID:", params.id);

  try {
    // Add cache busting to ensure fresh data
    const cacheBuster = Date.now();
    const response = await fetch(`${API}/api/articles/${params.id}?_=${cacheBuster}`);

    if (!response.ok) {
      throw new Error("Failed to fetch article");
    }

    const articleData = await response.json();
    console.log("Article data loaded:", articleData.title);
    console.log("Author info from API:", {
      authorUsername: articleData.authorUsername,
      authorRealname: articleData.authorRealname,
      authorAvatar: articleData.authorAvatar
    });

    // Helper function to get full image URL
    const getImageUrl = (url) => {
      if (!url) return defaultHeader;
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      return `${API}${url}`;
    };

    // Helper function to get avatar URL with cache busting
    const getAvatarUrl = (url) => {
      if (!url) return "/avatars/doraemon1.png";

      let fullUrl;
      if (url.startsWith("http://") || url.startsWith("https://")) {
        // External URL
        fullUrl = url;
      } else if (url.startsWith("/avatars/")) {
        // Frontend static avatar (default avatars)
        fullUrl = url; // Keep as-is, will be served by frontend
      } else if (url.startsWith("/uploads/")) {
        // Backend uploaded avatar
        fullUrl = `${API}${url}`;
      } else {
        // Fallback: assume it's a backend URL
        fullUrl = `${API}${url}`;
      }

      // Add timestamp to prevent browser caching
      const separator = fullUrl.includes("?") ? "&" : "?";
      return `${fullUrl}${separator}t=${Date.now()}`;
    };

    // Transform database data to match component expectations
    return {
      article: {
        id: articleData.id,
        title: articleData.title,
        content: articleData.content,
        date: articleData.date,

        // Header image (used as page background)
        headerImage: getImageUrl(articleData.headerUrl),

        // Content images
        images: articleData.images || [],

        // Author information
        author: {
          name: articleData.authorRealname || articleData.authorUsername || "Unknown",
          avatar: getAvatarUrl(articleData.authorAvatar)
        },

        // For debugging and future use
        userId: articleData.userId,

        // Like count
        likeCount: articleData.likeCount || 0,

        // Tags
        tags: articleData.tags || []
      }
    };
  } catch (error) {
    console.error("Error loading article:", error);

    // Return fallback data if API fails
    return {
      article: {
        id: params.id,
        title: "Article not found",
        content: "Sorry, we could not load this article.",
        date: new Date().toISOString(),
        headerImage: defaultHeader,
        images: [],
        author: {
          name: "Unknown",
          avatar: "/avatars/doraemon1.png"
        },
        likeCount: 0,
        tags: []
      }
    };
  }
};
