<script>
  import { createEventDispatcher } from "svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  export let articleAuthorId;
  export let comment;
  export let depth = 0;
  export let articleId;
  export let isLoggedIn = false;
  export let currentUser = null;

  const dispatch = createEventDispatcher();

  let showReplyForm = false;
  let replyContent = "";
  let isSubmitting = false;
  let showChildren = false; // Control visibility of children comments

  // Check if current user can edit/delete this comment
  $: canDelete =
    currentUser &&
    (articleAuthorId === currentUser.id ||
      currentUser.id === comment.userId ||
      currentUser.isAdmin);

  // Check if this comment has children
  $: hasChildren = comment.childrenComments && comment.childrenComments.length > 0;

  function toggleReplyForm() {
    showReplyForm = !showReplyForm;
    if (!showReplyForm) {
      replyContent = "";
    }
  }

  function toggleChildren() {
    showChildren = !showChildren;
  }

  async function submitReply() {
    if (!replyContent.trim() || isSubmitting) return;

    isSubmitting = true;

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          content: replyContent.trim(),
          articleId: articleId,
          parentCommentId: comment.id
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        dispatch("commentAdded", { comment: newComment, parentId: comment.id });
        replyContent = "";
        showReplyForm = false;
      } else {
        console.error("Failed to submit reply");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      isSubmitting = false;
    }
  }

  async function deleteComment() {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    isSubmitting = true;

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/comments/${comment.id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        dispatch("commentDeleted", { commentId: comment.id });
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      isSubmitting = false;
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }

  function getDepthSymbol(depth) {
    const symbols = ["●", "○", "■", "▲", "▼", "◆", "◇", "★", "☆", "♦"];
    return symbols[depth % symbols.length];
  }

  function getDepthColor(depth) {
    const colors = [
      "#007bff",
      "#28a745",
      "#dc3545",
      "#ffc107",
      "#6f42c1",
      "#17a2b8",
      "#fd7e14",
      "#6c757d",
      "#20c997",
      "#e83e8c"
    ];
    return colors[depth % colors.length];
  }

  // Handle events from child comments
  function handleCommentAdded(event) {
    dispatch("commentAdded", event.detail);
  }

  function handleCommentUpdated(event) {
    dispatch("commentUpdated", event.detail);
  }

  function handleCommentDeleted(event) {
    dispatch("commentDeleted", event.detail);
  }
</script>

<div class="comment-item depth-{depth}" style="margin-left: 20px;">
  <div class="comment-content">
    <span class="depth-symbol" style="color: {getDepthColor(depth)};">{getDepthSymbol(depth)}</span>
    <div class="comment-content-inner">
      <div class="comment-header">
        <div class="user-info">
          {#if comment.avatarUrl}
            <img src={comment.avatarUrl} alt={comment.username} class="avatar" />
          {:else}
            <div class="avatar-placeholder">
              {comment.username?.charAt(0)?.toUpperCase() || "?"}
            </div>
          {/if}
          <div class="user-details">
            <span class="username">{comment.username || "Anonymous"}</span>
            {#if comment.isAdmin}
              <span class="admin-badge">Admin</span>
            {/if}
          </div>
        </div>
        <span class="comment-date">{formatDate(comment.date)}</span>
      </div>

      <div class="comment-text">
        {comment.content}
      </div>

      <div class="comment-actions">
        {#if isLoggedIn}
          <button class="reply-btn" on:click={toggleReplyForm}>
            {showReplyForm ? "Cancel" : "Reply"}
          </button>
        {/if}
        {#if hasChildren}
          <button class="toggle-children-btn" on:click={toggleChildren}>
            {showChildren
              ? "Hide Replies"
              : `Show ${comment.childrenComments.length} Repl${comment.childrenComments.length === 1 ? "y" : "ies"}`}
          </button>
        {/if}
        {#if canDelete}
          <button class="delete-btn" on:click={deleteComment}> Delete </button>
        {/if}
      </div>
    </div>
  </div>

  {#if showReplyForm}
    <div class="reply-form">
      <textarea
        bind:value={replyContent}
        placeholder="Write your reply..."
        rows="3"
        disabled={isSubmitting}
      ></textarea>
      <div class="reply-actions">
        <button
          class="submit-btn"
          on:click={submitReply}
          disabled={!replyContent.trim() || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Reply"}
        </button>
      </div>
    </div>
  {/if}

  <!-- Render children comments recursively -->
  {#if comment.childrenComments && comment.childrenComments.length > 0 && showChildren}
    <div class="children-comments">
      {#each comment.childrenComments as childComment (childComment.id)}
        <svelte:self
          comment={childComment}
          depth={depth + 1}
          {articleId}
          {isLoggedIn}
          {currentUser}
          on:commentAdded={handleCommentAdded}
          on:commentUpdated={handleCommentUpdated}
          on:commentDeleted={handleCommentDeleted}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .comment-item {
    border-left: 2px solid #e0e0e0;
    padding-left: 12px;
    transition: border-color 0.2s ease;
    position: relative;
  }

  .comment-item:hover {
    border-left-color: #007bff;
  }

  .comment-content {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .comment-content-inner {
    display: flex;
    flex-direction: column;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .depth-symbol {
    font-size: 24px;
    font-weight: bold;
    margin-left: -4px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
  }

  .user-details {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .username {
    font-weight: 600;
    color: #333;
  }

  .admin-badge {
    background: #dc3545;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
  }

  .comment-date {
    color: #666;
    font-size: 12px;
    margin-left: 8px;
  }

  .comment-text {
    color: #333;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .comment-actions {
    display: flex;
    gap: 8px;
  }

  .reply-btn,
  .delete-btn,
  .toggle-children-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .reply-btn {
    color: #007bff;
  }

  .reply-btn:hover {
    background: #e3f2fd;
  }

  .delete-btn {
    color: #dc3545;
  }

  .delete-btn:hover {
    background: #f8d7da;
  }

  .reply-form {
    margin-top: 12px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .reply-form textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    font-family: inherit;
    resize: vertical;
    margin-bottom: 8px;
  }

  .reply-form textarea:focus {
    outline: none;
    border-color: #007bff;
  }

  .reply-actions,
  .edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .submit-btn,
  .save-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .submit-btn:hover:not(:disabled),
  .save-btn:hover:not(:disabled) {
    background: #0056b3;
  }

  .submit-btn:disabled,
  .save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .children-comments {
    margin-top: 16px;
  }

  .toggle-children-btn {
    color: #6c757d;
  }

  .toggle-children-btn:hover {
    background: #e9ecef;
  }
</style>
