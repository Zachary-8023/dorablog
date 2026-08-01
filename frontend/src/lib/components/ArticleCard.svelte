<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { userStore } from "$lib/session.js";
  import { showError } from "$lib/toastStore.js";
  import { API } from "$lib/api.js";
  import likeIcon from "../../assets/images/like-icon.png";
  import commentIcon from "../../assets/images/comment.png";

  export let article;

  $: isLoggedIn = $userStore !== null;
  $: currentUser = $userStore;

  let commentCount = article.comments || 0;
  let likeCount = article.likes || 0;
  let liked = false;

  function handleCardClick() {
    goto(`/articles/${article.id}`);
  }

  onMount(async () => {
    if (article.id) {
      try {
        const response = await fetch(`${API}/api/comments/articles/${article.id}`);
        if (response.ok) {
          const comments = await response.json();
          commentCount = comments.length;
        }

        if (isLoggedIn) {
          const likedResponse = await fetch(`${API}/api/articles/${article.id}/liked`, {
            credentials: "include"
          });
          if (likedResponse.ok) {
            const likedData = await likedResponse.json();
            liked = likedData.liked;
          }
        }
      } catch (error) {
        console.error("Error loading article data:", error);
      }
    }
  });

  async function handleLikeClick(event) {
    event.stopPropagation();

    if (!isLoggedIn) {
      showError("Please log in to like articles");
      return;
    }

    try {
      const response = await fetch(`${API}/api/articles/like/${article.id}`, {
        method: "POST",
        credentials: "include"
      });

      if (response.ok) {
        const result = await response.json();
        likeCount = result.likeCount;
        liked = !liked;
      } else if (response.status === 401) {
        showError("You need to log in to like articles");
      } else {
        console.error("Failed to like article:", response.status);
        showError("Failed to like article");
      }
    } catch (error) {
      console.error("Error liking article:", error);
      showError("Error liking article");
    }
  }
</script>

<div
  class="article-card"
  on:click={handleCardClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === "Enter" && handleCardClick()}
>
  <div class="main-image-container">
    <img src={article.avatar} alt={article.title} class="main-image" />
  </div>

  <div class="content">
    <h3 class="title">{article.title}</h3>
    <div class="author-info">
      <img src={article.authorAvatar} alt="Author Avatar" class="author-avatar" />
      <p class="author">{article.author}</p>
    </div>
    <p class="excerpt">{article.excerpt}</p>

    <div class="interaction-container" on:click|stopPropagation>
      <span class="like" class:liked on:click={handleLikeClick}>
        <img src={likeIcon} alt="Like" />
        {likeCount}
      </span>
      <span class="comment">
        <img src={commentIcon} alt="Comment" />
        {commentCount}
      </span>
    </div>
  </div>
</div>

<style>
  .article-card {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    margin: 1rem;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.3s ease;
    width: 250px;
    max-width: 100%;
    position: relative;
    min-height: 400px;
    cursor: pointer;
  }

  [data-theme="dark"] .article-card {
    background-color: rgba(26, 32, 44, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .article-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  [data-theme="dark"] .article-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  }

  .main-image-container {
    width: 100%;
    height: 160px;
    overflow: hidden;
    border-radius: 12px;
    margin-bottom: 1rem;
    background-color: #d0eaff;
    transition: background-color 0.3s ease;
  }

  [data-theme="dark"] .main-image-container {
    background-color: #2d3748;
  }

  .main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .content {
    text-align: left;
    background-color: transparent;
    padding: 0;
  }

  .title {
    font-size: 1.1rem;
    font-weight: bold;
    color: #0066cc;
    margin: 0;
    line-height: 1.4;
    transition: color 0.3s ease;
  }

  [data-theme="dark"] .title {
    color: #63b3ed;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.2rem 0;
  }

  .author-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
  }

  .author {
    font-size: 0.8rem;
    color: #0066cc;
    margin: 0;
    font-style: italic;
    transition: color 0.3s ease;
  }

  [data-theme="dark"] .author {
    color: #63b3ed;
  }

  .excerpt {
    font-size: 0.9rem;
    color: #333;
    margin: 0.5rem 0;
    line-height: 1.4;
    text-align: left;
    padding: 0 0.5rem;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    transition: color 0.3s ease;
  }

  [data-theme="dark"] .excerpt {
    color: #e2e8f0;
  }

  .interaction-container {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: #0066cc;
    transition: color 0.3s ease;
  }

  [data-theme="dark"] .interaction-container {
    color: #63b3ed;
  }

  .like,
  .comment {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .like:hover,
  .comment:hover {
    color: #003399;
  }

  .like.liked {
    color: #667eea;
  }

  .like.liked img {
    filter: brightness(0) saturate(100%) invert(52%) sepia(89%) saturate(1644%) hue-rotate(221deg)
      brightness(97%) contrast(90%);
    transform: scale(1.1);
  }

  [data-theme="dark"] .like.liked {
    color: #a78bfa;
  }

  [data-theme="dark"] .like:hover,
  [data-theme="dark"] .comment:hover {
    color: #90cdf4;
  }

  .like img,
  .comment img {
    width: 20px;
    height: 20px;
  }
</style>
