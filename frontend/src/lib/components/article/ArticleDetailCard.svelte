<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import ImageGrid from "./ImageGrid.svelte";
  import { api, API, getResourceUrl } from "../../api.js";
  import Editor from "@tinymce/tinymce-svelte";
  import { userStore } from "$lib/session.js";

  export let title = "";
  export let text = "";
  export let images = [];
  export let date = "";
  export let authorName = "";
  export let articleId = null;
  export let initialLikeCount = 0;
  export let tags = [];
  export let userId = null;

  import likeIcon from "../../../assets/images/like-icon.png";
  import commentIcon from "../../../assets/images/comment.png";
  import { showSuccess, showError } from "$lib/toastStore.js";

  let liked = false;
  let likeCount = initialLikeCount;
  let commentCount = 0;
  let isLoading = false;

  let isEditing = false;
  let editedContent = "";
  let uploadedImages = [...images];
  let isSaving = false;

  $: displayText = (() => {
    if (!text) return "";
    let cleaned = text.trim();
    let previousText = "";
    while (previousText !== cleaned) {
      previousText = cleaned;
      cleaned = cleaned.replace(/(<p><br\s*\/?><\/p>\s*)+$/gi, "");
      cleaned = cleaned.replace(/(<p>&nbsp;<\/p>\s*)+$/gi, "");
      cleaned = cleaned.replace(/(<p>(&nbsp;|\s)+<\/p>\s*)+$/gi, "");
      cleaned = cleaned.replace(/(<p>\s*<\/p>\s*)+$/gi, "");
      cleaned = cleaned.replace(/(<br\s*\/?>\s*)+$/gi, "");
      cleaned = cleaned.replace(/(&nbsp;\s*)+$/gi, "");
    }
    return cleaned;
  })();

  $: isLoggedIn = $userStore !== null;
  $: currentUser = $userStore;

  $: canEditDelete =
    isLoggedIn && currentUser && userId && (currentUser.id === userId || currentUser.isAdmin);

  async function loadArticleData() {
    if (articleId) {
      try {
        if (isLoggedIn) {
          const likedResponse = await fetch(`${API}/api/articles/${articleId}/liked`, {
            credentials: "include"
          });
          if (likedResponse.ok) {
            const likedData = await likedResponse.json();
            liked = likedData.liked;
          }
        } else {
          liked = false;
        }

        // Get comment count
        const commentResponse = await fetch(`${API}/api/comments/articles/${articleId}`);
        if (commentResponse.ok) {
          const comments = await commentResponse.json();
          commentCount = comments.length;
        }
      } catch (error) {
        console.error("Error loading article data:", error);
      }
    }
  }

  $: if (articleId) {
    loadArticleData();
  }

  // Check if user has liked this article on mount and get comment count
  onMount(async () => {
    await loadArticleData();
  });

  // Toggle like/unlike
  async function handleLike() {
    if (!isLoggedIn) {
      showError("Please log in to like articles");
      return;
    }

    if (!articleId || isLoading) return;

    isLoading = true;

    try {
      const response = await fetch(`${API}/api/articles/like/${articleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        liked = data.liked;
        likeCount = data.likeCount;
      } else if (response.status === 401) {
        showError("You need to log in to like articles");
      } else {
        showError("Failed to like article");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      showError("Error liking article");
    } finally {
      isLoading = false;
    }
  }

  // Get tag color
  function getTagColor(colorName) {
    const colors = {
      blue: "#3b82f6",
      green: "#10b981",
      orange: "#f59e0b",
      purple: "#8b5cf6",
      red: "#ef4444",
      yellow: "#eab308",
      cyan: "#06b6d4",
      pink: "#ec4899",
      magenta: "#d946ef",
      gray: "#6b7280"
    };
    return colors[colorName] || colors.gray;
  }

  const apiKey = "z285vuatv7et9z4jdzehijd9c1gcajgfo9gbik4k63hpqqyf";

  const editorConfig = {
    height: 400,
    menubar: "file edit view insert format",
    plugins:
      "image lists link anchor autolink charmap codesample emoticons media searchreplace table visualblocks wordcount",
    toolbar:
      "undo redo | blocks | bold italic underline | image link | bullist numlist | removeformat",
    content_style:
      "body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }",
    branding: false,
    promotion: false,

    images_upload_handler: async (blobInfo, progress) => {
      return new Promise(async (resolve, reject) => {
        try {
          if (uploadedImages.length >= 9) {
            reject("Maximum 9 images allowed. Please remove some images before uploading more.");
            return;
          }

          const file = blobInfo.blob();
          if (!file.type.startsWith("image/")) {
            reject("Please select an image file");
            return;
          }

          if (file.size > 10 * 1024 * 1024) {
            reject("File size must be less than 10MB");
            return;
          }

          const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
          const fileName = blobInfo.filename().toLowerCase();
          const fileExtension = fileName.substring(fileName.lastIndexOf("."));
          if (!allowedExtensions.includes(fileExtension)) {
            reject("Only JPG, PNG, GIF, and WebP images are allowed");
            return;
          }

          const formData = new FormData();
          formData.append("image", file, blobInfo.filename());

          const response = await fetch(`${API}/api/articles/upload-image`, {
            method: "POST",
            body: formData
          });

          const result = await response.json();

          if (result.success) {
            const imageUrl = getResourceUrl(result.imageUrl);
            uploadedImages = [...uploadedImages, result.imageUrl];
            resolve(imageUrl);
          } else {
            reject("Upload failed: " + (result.error || "Unknown error"));
          }
        } catch (error) {
          reject("Upload failed: " + error.message);
        }
      });
    },

    image_advtab: false,
    image_title: false,
    image_description: false,
    image_dimensions: false,
    image_caption: false,
    paste_data_images: true,

    setup: (editor) => {
      editor.on("OpenWindow", (e) => {
        setTimeout(() => {
          const dialog = document.querySelector(".tox-dialog");
          if (dialog) {
            const formGroups = dialog.querySelectorAll(".tox-form__group");
            formGroups.forEach((group) => {
              const label = group.querySelector("label");
              if (label && label.textContent.toLowerCase().includes("class")) {
                group.style.display = "none";
              }
            });

            const tabs = dialog.querySelectorAll(".tox-dialog__body-nav-item");
            tabs.forEach((tab) => {
              const tabText = tab.textContent.toLowerCase();
              if (tabText.includes("upload")) {
                tab.click();
              }
            });
          }
        }, 10);
      });

      editor.on("NodeChange", (e) => {
        const images = editor.getBody().querySelectorAll("img:not([data-processed])");
        images.forEach((img) => {
          img.setAttribute("data-processed", "true");
          img.classList.add("thumbnail-image");

          const body = editor.getBody();
          const allImages = body.querySelectorAll("img.thumbnail-image");
          const textContent = editor.getContent({ format: "text" }).trim();

          if (allImages.length === 1) {
            const hasText = textContent && textContent.length > 0;

            if (!hasText) {
              const p = editor.getDoc().createElement("p");
              p.innerHTML = "<br>";
              body.insertBefore(p, body.firstChild);
            } else {
              const parent = img.parentNode;
              const imageContainer = editor.getDoc().createElement("p");
              if (parent) {
                parent.removeChild(img);
              }
              imageContainer.appendChild(img);
              body.appendChild(imageContainer);
              if (parent && parent.childNodes.length === 0 && parent.parentNode) {
                parent.parentNode.removeChild(parent);
              }
            }

            setTimeout(() => {
              const range = editor.getDoc().createRange();
              const sel = editor.selection.getSel();
              range.setStartAfter(img);
              range.setEndAfter(img);
              sel.removeAllRanges();
              sel.addRange(range);
              editor.focus();
            }, 10);
          } else {
            setTimeout(() => {
              const range = editor.getDoc().createRange();
              const sel = editor.selection.getSel();
              range.setStartAfter(img);
              range.setEndAfter(img);
              sel.removeAllRanges();
              sel.addRange(range);
              editor.focus();
            }, 10);
          }
        });
      });

      editor.on("init", () => {
        const style = editor.getDoc().createElement("style");
        style.textContent = `
          .thumbnail-image {
            width: 150px !important;
            height: 150px !important;
            object-fit: cover !important;
            display: inline-block !important;
            margin: 5px !important;
            border-radius: 8px !important;
            vertical-align: top !important;
          }
        `;
        editor.getDoc().head.appendChild(style);
      });
    }
  };

  function startEditing() {
    isEditing = true;
    uploadedImages = [...images];

    let cleanText = text.trim();

    let previousText = "";
    while (previousText !== cleanText) {
      previousText = cleanText;
      cleanText = cleanText.replace(/(<p><br\s*\/?><\/p>\s*)+$/gi, "");
      cleanText = cleanText.replace(/(<p>&nbsp;<\/p>\s*)+$/gi, "");
      cleanText = cleanText.replace(/(<p>(&nbsp;|\s)+<\/p>\s*)+$/gi, "");
      cleanText = cleanText.replace(/(<p>\s*<\/p>\s*)+$/gi, "");
      cleanText = cleanText.replace(/(<br\s*\/?>\s*)+$/gi, "");
      cleanText = cleanText.replace(/(&nbsp;\s*)+$/gi, "");
    }

    let contentWithImages = cleanText;

    if (images && images.length > 0) {
      contentWithImages += "<p>";
      images.forEach((imageUrl) => {
        const fullUrl = getResourceUrl(imageUrl);
        contentWithImages += `<img src="${fullUrl}" class="thumbnail-image" data-processed="true" style="width: 150px; height: 150px; object-fit: cover; display: inline-block; margin: 5px; border-radius: 8px; vertical-align: top;" />`;
      });
      contentWithImages += "</p>";
    }

    editedContent = contentWithImages;
  }

  function cancelEditing() {
    isEditing = false;
    editedContent = "";
    uploadedImages = [...images];
  }

  async function confirmDelete() {
    if (!articleId) return;

    try {
      const response = await fetch(`${API}/api/articles/${articleId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        showSuccess("Article deleted successfully!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else if (response.status === 401) {
        showError("Please log in to delete articles");
        setTimeout(() => goto("/login"), 1500);
      } else if (response.status === 403) {
        showError("You don't have permission to delete this article");
      } else {
        console.error("Delete failed:", responseText);
        showError("Failed to delete article. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      showError("Error deleting article. Please check your connection.");
    }
  }

  async function saveEditing() {
    if (isSaving) return;

    isSaving = true;

    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = editedContent.trim() || "";

      const imgs = tempDiv.querySelectorAll("img");
      const imageUrls = [];

      imgs.forEach((img) => {
        let src = img.getAttribute("src");
        if (src && src.startsWith(API)) {
          src = src.replace(API, "");
        }
        if (src) {
          imageUrls.push(src);
        }
        img.remove();
      });

      let contentWithoutImages = tempDiv.innerHTML.trim();

      let previousContent = "";
      while (previousContent !== contentWithoutImages) {
        previousContent = contentWithoutImages;
        contentWithoutImages = contentWithoutImages.replace(/(<p><br\s*\/?><\/p>\s*)+$/gi, "");
        contentWithoutImages = contentWithoutImages.replace(/(<p>&nbsp;<\/p>\s*)+$/gi, "");
        contentWithoutImages = contentWithoutImages.replace(/(<p>(&nbsp;|\s)+<\/p>\s*)+$/gi, "");
        contentWithoutImages = contentWithoutImages.replace(/<p><\/p>\s*$/gi, "");
        contentWithoutImages = contentWithoutImages.replace(/<p>\s+<\/p>\s*$/gi, "");
        contentWithoutImages = contentWithoutImages.replace(/<br\s*\/?>\s*$/gi, "");
        contentWithoutImages = contentWithoutImages.replace(/&nbsp;\s*$/gi, "");
        contentWithoutImages = contentWithoutImages.replace(/\s+$/g, "");
      }

      const response = await fetch(`${API}/api/articles/${articleId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: contentWithoutImages,
          contentImages: imageUrls
        })
      });

      const responseText = await response.text();

      if (response.ok) {
        const responseData = JSON.parse(responseText);
        showSuccess("Article saved successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else if (response.status === 401) {
        showError("Please log in to edit articles");
        setTimeout(() => goto("/login"), 1500);
      } else if (response.status === 403) {
        showError("You don't have permission to edit this article");
      } else {
        console.error("Save failed:", responseText);
        showError("Failed to save article. Please try again.");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      showError("Error saving article. Please check your connection.");
    } finally {
      isSaving = false;
    }
  }
</script>

<section class="card">
  <div class="action-buttons">
    <button
      class="like-btn"
      class:liked
      class:loading={isLoading}
      on:click={handleLike}
      disabled={isLoading}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <img src={likeIcon} alt="like" />
      {#if likeCount > 0}
        <span class="like-count">{likeCount}</span>
      {/if}
    </button>

    <button class="comment-btn" aria-label="Comments">
      <img src={commentIcon} alt="comment" />
      {#if commentCount > 0}
        <span class="comment-count">{commentCount}</span>
      {/if}
    </button>
  </div>

  <h1 class="title">{title}</h1>
  <div class="meta-line">
    <p class="meta">By <strong>{authorName}</strong> · {date}</p>
    {#if tags && tags.length > 0}
      <div class="tags">
        {#each tags as tag}
          <span class="tag" style="background-color: {getTagColor(tag.color)}">
            {tag.tag}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  {#if !isEditing}
    <article class="body">{@html displayText}</article>

    {#if images && images.length}
      <div class="images">
        <ImageGrid {images} />
      </div>
    {/if}

    {#if canEditDelete}
      <div class="article-actions">
        <button class="text-btn edit-text-btn" on:click={startEditing} aria-label="Edit article">
          ✏️ Edit Article
        </button>
        <button
          class="text-btn delete-text-btn"
          on:click={confirmDelete}
          aria-label="Delete article"
        >
          🗑️ Delete Article
        </button>
      </div>
    {/if}
  {:else}
    <div class="editor-container">
      <p class="helper-text">
        💡 Tip: Click the image button (🖼️) in the toolbar, or drag & drop images directly into the
        editor. Maximum 9 images. Current images are shown below the text.
      </p>
      <Editor bind:value={editedContent} conf={editorConfig} {apiKey} />
    </div>

    <div class="article-actions editing">
      <button
        class="text-btn save-text-btn"
        on:click={saveEditing}
        disabled={isSaving}
        aria-label="Save changes"
      >
        {isSaving ? "💾 Saving..." : "💾 Save Changes"}
      </button>
      <button
        class="text-btn cancel-text-btn"
        on:click={cancelEditing}
        disabled={isSaving}
        aria-label="Cancel editing"
      >
        ❌ Cancel
      </button>
    </div>
  {/if}
</section>

<style>
  .card {
    position: relative;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 16px 18px 18px;
    transition:
      background 0.3s ease,
      box-shadow 0.3s ease;
  }

  [data-theme="dark"] .card {
    background: rgba(26, 32, 44, 0.8);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .action-buttons {
    position: absolute;
    top: 12px;
    right: 14px;
    display: flex;
    gap: 8px;
  }

  .delete-btn,
  .edit-btn,
  .save-btn,
  .cancel-btn,
  .like-btn,
  .comment-btn {
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border: 0;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .delete-btn img {
    width: 20px;
    height: 20px;
    display: block;
    transition: transform 0.3s ease;
  }

  .delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
  }

  .delete-btn:hover img {
    transform: scale(1.1);
  }

  .edit-btn img {
    width: 20px;
    height: 20px;
    display: block;
    transition: transform 0.3s ease;
  }

  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  .edit-btn:hover img {
    transform: scale(1.1);
  }

  .save-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 0 12px;
  }

  .save-btn:hover:not(:disabled) {
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  }

  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    padding: 0 12px;
  }

  .cancel-btn:hover:not(:disabled) {
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
  }

  .like-btn img,
  .comment-btn img {
    width: 20px;
    height: 20px;
    display: block;
    transition: transform 0.3s ease;
  }

  .like-btn:hover,
  .comment-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  .like-btn:hover img,
  .comment-btn:hover img {
    transform: scale(1.1);
  }

  .like-btn.liked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .like-btn.liked img {
    filter: brightness(0) invert(1);
    transform: scale(1.2);
  }

  .like-btn.liked:hover {
    box-shadow: 0 8px 28px rgba(102, 126, 234, 0.5);
  }

  .like-btn.loading {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .like-btn:disabled {
    cursor: not-allowed;
  }

  .like-count,
  .comment-count {
    font-size: 1.05rem;
    font-weight: 600;
    color: #333;
    transition: color 0.3s ease;
  }

  .like-btn.liked .like-count {
    color: #fff;
  }

  .title {
    margin: 0.25rem 4px 0.4rem;
    padding-right: 100px;
    line-height: 1.2;
    color: #0f2a66;
    font-weight: 800;
    font-size: 2rem;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
    transition: color 0.3s ease;
  }

  [data-theme="dark"] .title {
    color: #e2e8f0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .meta-line {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 4px 12px;
    flex-wrap: wrap;
  }

  .meta {
    margin: 0;
    color: #3b5a96;
    font-size: 0.95rem;
    opacity: 0.9;
    transition: color 0.3s ease;
  }

  [data-theme="dark"] .meta {
    color: #9cb3e0;
  }

  .tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tag {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .article-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(59, 90, 150, 0.1);
  }

  .article-actions.editing {
    border-top: none;
    padding-top: 16px;
  }

  .text-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 24px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .edit-text-btn {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: white;
  }

  .edit-text-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .delete-text-btn {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: white;
  }

  .delete-text-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }

  .save-text-btn {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    color: white;
  }

  .save-text-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .save-text-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cancel-text-btn {
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
    color: white;
  }

  .cancel-text-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
  }

  .cancel-text-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .body {
    color: #123;
    line-height: 1.8;
    margin-bottom: 12px;
    transition: color 0.3s ease;
  }

  [data-theme="dark"] .body {
    color: #cbd5e0;
  }

  /* Style for HTML content from TinyMCE */
  .body :global(p) {
    margin-bottom: 1em;
  }

  .body :global(h1),
  .body :global(h2),
  .body :global(h3),
  .body :global(h4),
  .body :global(h5),
  .body :global(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 700;
    color: #0f2a66;
  }

  .body :global(ul),
  .body :global(ol) {
    margin-left: 1.5em;
    margin-bottom: 1em;
  }

  .body :global(li) {
    margin-bottom: 0.5em;
  }

  .body :global(strong) {
    font-weight: 700;
  }

  .body :global(em) {
    font-style: italic;
  }

  .body :global(a) {
    color: #667eea;
    text-decoration: underline;
  }

  .body :global(a:hover) {
    color: #764ba2;
  }

  .body :global(blockquote) {
    border-left: 4px solid #667eea;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: #555;
  }

  .body :global(code) {
    background: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  .body :global(pre) {
    background: #f5f5f5;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
  }

  .body :global(pre code) {
    background: none;
    padding: 0;
  }

  .images {
    margin-top: 6px;
  }

  .editor-container {
    margin: 20px 0;
  }

  .helper-text {
    font-size: 0.85rem;
    color: #667eea;
    margin: 0 0 0.5rem 0;
    font-style: italic;
    background: #f0f4ff;
    padding: 0.5rem;
    border-radius: 6px;
    border-left: 3px solid #667eea;
  }

  .images-title {
    font-size: 1rem;
    font-weight: 600;
    color: #0f2a66;
    margin: 0 0 10px 0;
  }
</style>
