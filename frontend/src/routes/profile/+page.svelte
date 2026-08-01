<script>
  import { onMount } from "svelte";
  import { api, API, getResourceUrl } from "$lib/api";
  import { userStore, loadMe } from "$lib/session";
  import { goto } from "$app/navigation";
  import AvatarSelector from "$lib/components/AvatarSelector.svelte";

  let user = null;
  let editing = false;
  let loading = true;
  let saving = false;
  let error = "";
  let success = "";

  // Form fields
  let username = "";
  let realname = "";
  let birthdate = "";
  let description = "";
  let selectedAvatar = "";
  let customAvatarFile = null;
  let currentAvatarUrl = "";

  // Password change
  let showPasswordChange = false;
  let newPassword = "";
  let confirmPassword = "";
  let passwordError = "";

  // Username validation
  let usernameChecking = false;
  let usernameAvailable = null;
  let usernameError = "";
  let originalUsername = "";

  // Delete confirmation
  let showDeleteConfirm = false;
  let deleteConfirmText = "";

  $: user = $userStore;

  onMount(async () => {
    await loadMe();
    if (!$userStore) {
      goto("/login");
      return;
    }

    // Load user data into form
    username = $userStore.username || "";
    originalUsername = $userStore.username || "";
    realname = $userStore.realname || "";
    birthdate = $userStore.birthdate || "";
    description = $userStore.description || "";
    currentAvatarUrl = $userStore.avatarUrl || "";

    loading = false;
  });

  let usernameCheckTimeout;
  async function checkUsername() {
    if (username === originalUsername) {
      usernameError = "";
      usernameAvailable = true;
      return;
    }

    if (!username || username.length < 3) {
      usernameError = "Username must be at least 3 characters";
      usernameAvailable = false;
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameError = "Username can only contain letters, numbers, and underscores";
      usernameAvailable = false;
      return;
    }

    usernameChecking = true;
    usernameError = "";

    try {
      const data = await api(`/api/auth/registered?username=${encodeURIComponent(username)}`);

      if (data.registered) {
        usernameError = "Username already taken";
        usernameAvailable = false;
      } else {
        usernameError = "";
        usernameAvailable = true;
      }
    } catch (e) {
      usernameError = `Unable to check username`;
      usernameAvailable = false;
    } finally {
      usernameChecking = false;
    }
  }

  $: if (editing && username && username !== originalUsername) {
    clearTimeout(usernameCheckTimeout);
    usernameCheckTimeout = setTimeout(checkUsername, 500);
  }

  function handleAvatarSelect(avatarId, file = null) {
    selectedAvatar = avatarId;
    customAvatarFile = file;
  }

  async function saveProfile() {
    error = "";
    success = "";

    if (username !== originalUsername && !usernameAvailable) {
      error = usernameError || "Please choose a different username";
      return;
    }

    saving = true;

    try {
      const updateData = {
        username,
        realname,
        birthdate,
        description
      };

      // Handle avatar update
      if (selectedAvatar === "custom" && customAvatarFile) {
        const formData = new FormData();
        formData.append("avatar", customAvatarFile);

        const uploadResponse = await api("/api/auth/upload-avatar", {
          method: "POST",
          body: formData
        });

        updateData.avatarUrl = uploadResponse.avatarUrl;
      } else if (selectedAvatar && selectedAvatar !== "custom") {
        const defaultAvatars = [
          { id: "avatar-leo", src: "/avatars/avatar-leo.png" },
          { id: "avatar-stevenshi", src: "/avatars/avatar-stevenshi.png" },
          { id: "avatar-xuan", src: "/avatars/avatar-xuan.png" },
          { id: "avatar-zhongwei", src: "/avatars/avatar-zhongwei.png" },
          { id: "doraemon1", src: "/avatars/doraemon1.png" },
          { id: "doraemon2", src: "/avatars/doraemon2.png" },
          { id: "doraemon3", src: "/avatars/doraemon3.png" },
          { id: "doraemon4", src: "/avatars/doraemon4.png" }
        ];
        const avatar = defaultAvatars.find((a) => a.id === selectedAvatar);
        if (avatar) {
          updateData.avatarUrl = avatar.src;
        }
      }

      // Handle password update
      if (showPasswordChange && newPassword) {
        if (newPassword !== confirmPassword) {
          passwordError = "Passwords do not match";
          saving = false;
          return;
        }
        if (newPassword.length < 6) {
          passwordError = "Password must be at least 6 characters";
          saving = false;
          return;
        }
        updateData.password = newPassword;
      }

      const response = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Update failed" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      success = "Profile updated successfully! ✓";
      editing = false;
      showPasswordChange = false;
      newPassword = "";
      confirmPassword = "";
      passwordError = "";
      selectedAvatar = "";
      customAvatarFile = null;

      // Reload user data
      await loadMe();
      currentAvatarUrl = $userStore.avatarUrl || "";
      originalUsername = username;
      usernameAvailable = true;
      usernameError = "";

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        success = "";
      }, 5000);
    } catch (e) {
      error = e.message || "Failed to update profile";
    } finally {
      saving = false;
    }
  }

  async function deleteAccount() {
    if (deleteConfirmText !== username) {
      error = "Username does not match";
      return;
    }

    try {
      const response = await fetch(`${API}/api/users/me`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // Clear user session state
      userStore.set(null);

      // Show success message and redirect after a short delay
      showDeleteConfirm = false;
      success = "✓ Account deleted successfully. Redirecting to home page...";
      setTimeout(() => {
        goto("/");
      }, 2000);
    } catch (e) {
      error = e.message || "Failed to delete account";
    }
  }

  function cancelEdit() {
    editing = false;
    error = "";
    success = "";
    showPasswordChange = false;
    passwordError = "";
    usernameError = "";
    usernameAvailable = null;

    // Reset form to current user data
    username = $userStore.username || "";
    originalUsername = $userStore.username || "";
    realname = $userStore.realname || "";
    birthdate = $userStore.birthdate || "";
    description = $userStore.description || "";
    selectedAvatar = "";
    customAvatarFile = null;
  }
</script>

<div class="profile-page">
  <div class="container">
    {#if loading}
      <div class="loading">Loading profile...</div>
    {:else}
      <div class="profile-card">
        <div class="profile-header">
          <h1>My Profile</h1>
          {#if !editing}
            <button
              class="btn-edit"
              on:click={() => {
                editing = true;
                error = "";
                success = "";
              }}
            >
              Edit Profile
            </button>
          {/if}
        </div>

        <!-- Success/Error messages - visible in both modes -->
        {#if error}
          <div class="message error">{error}</div>
        {/if}

        {#if success}
          <div class="message success">{success}</div>
        {/if}

        {#if !editing}
          <!-- View Mode -->
          <div class="profile-view">
            <div class="avatar-display">
              {#if currentAvatarUrl}
                <img
                  src={getResourceUrl(currentAvatarUrl)}
                  alt={username}
                  class="avatar-large"
                  on:error={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
                <div class="avatar-placeholder-large" style="display: none;">
                  {username.charAt(0).toUpperCase()}
                </div>
              {:else}
                <div class="avatar-placeholder-large">
                  {username.charAt(0).toUpperCase()}
                </div>
              {/if}
            </div>

            <div class="info-group">
              <label>Username</label>
              <div class="info-value">{username}</div>
            </div>

            <div class="info-group">
              <label>Real Name</label>
              <div class="info-value">{realname || "Not set"}</div>
            </div>

            <div class="info-group">
              <label>Date of Birth</label>
              <div class="info-value">{birthdate || "Not set"}</div>
            </div>

            <div class="info-group">
              <label>About Me</label>
              <div class="info-value">{description || "No description yet"}</div>
            </div>

            <div class="danger-zone">
              <h3>Danger Zone</h3>
              <p class="danger-warning">
                ⚠️ Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
              <button
                class="btn-danger"
                on:click={() => {
                  showDeleteConfirm = true;
                  error = "";
                  success = "";
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        {:else}
          <!-- Edit Mode -->
          <form on:submit|preventDefault={saveProfile} class="profile-edit">
            <div class="form-group">
              <label>Avatar</label>
              <div class="current-avatar">
                {#if currentAvatarUrl}
                  <img
                    src={getResourceUrl(currentAvatarUrl)}
                    alt={username}
                    class="avatar-medium"
                    on:error={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span>Current Avatar</span>
                {/if}
              </div>
              <AvatarSelector bind:selectedAvatar onAvatarSelect={handleAvatarSelect} />
            </div>

            <div class="form-group">
              <label for="username">Username</label>
              <input
                id="username"
                type="text"
                bind:value={username}
                class:checking={usernameChecking}
                class:error={usernameError && username !== originalUsername}
                class:success={usernameAvailable && username !== originalUsername}
                required
              />
              {#if usernameChecking}
                <div class="status-message checking">Checking availability...</div>
              {/if}
              {#if usernameError && username !== originalUsername}
                <div class="status-message error">{usernameError}</div>
              {/if}
              {#if usernameAvailable && username !== originalUsername}
                <div class="status-message success">✓ Username available</div>
              {/if}
              {#if username === originalUsername}
                <div class="status-message info">Current username (no change)</div>
              {/if}
            </div>

            <div class="form-group">
              <label for="realname">Real Name</label>
              <input id="realname" type="text" bind:value={realname} />
            </div>

            <div class="form-group">
              <label for="birthdate">Date of Birth</label>
              <input id="birthdate" type="date" bind:value={birthdate} />
            </div>

            <div class="form-group">
              <label for="description">About Me</label>
              <textarea id="description" bind:value={description} rows="4"></textarea>
            </div>

            <div class="password-section">
              <button
                type="button"
                class="btn-toggle-password"
                on:click={() => (showPasswordChange = !showPasswordChange)}
              >
                {showPasswordChange ? "Cancel Password Change" : "Change Password"}
              </button>

              {#if showPasswordChange}
                <div class="password-fields">
                  <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      bind:value={newPassword}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div class="form-group">
                    <label for="confirmPassword">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      bind:value={confirmPassword}
                      placeholder="Re-enter new password"
                    />
                  </div>

                  {#if passwordError}
                    <div class="error-message">{passwordError}</div>
                  {/if}
                </div>
              {/if}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" on:click={cancelEdit}> Cancel </button>
              <button type="submit" class="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if showDeleteConfirm}
  <div class="modal-overlay" on:click={() => (showDeleteConfirm = false)}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Delete Account</h2>
        <button class="close-btn" on:click={() => (showDeleteConfirm = false)}>×</button>
      </div>

      <div class="modal-body">
        <p class="warning-text">
          ⚠️ <strong>This action cannot be undone!</strong><br />
          All your articles, comments, and personal data will be permanently deleted.
        </p>

        <p class="confirm-instruction">To confirm deletion, please type your username below:</p>
        <p class="username-display"><strong>{username}</strong></p>

        <input
          type="text"
          bind:value={deleteConfirmText}
          placeholder="Enter your username"
          class="confirm-input"
        />

        {#if error}
          <div class="error-message">{error}</div>
        {/if}
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" on:click={() => (showDeleteConfirm = false)}> Cancel </button>
        <button
          class="btn-danger"
          on:click={deleteAccount}
          disabled={deleteConfirmText !== username}
        >
          Delete My Account
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .profile-page {
    min-height: calc(100vh - 60px);
    padding: 2rem 0;
    background: url("/background.jpg") center/cover fixed;
    position: relative;
  }

  .profile-page::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(208, 234, 255, 0.8);
    backdrop-filter: blur(3px);
    z-index: 0;
  }

  .container {
    max-width: 650px;
    margin: 0 auto;
    padding: 0 1rem;
    position: relative;
    z-index: 1;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #0066cc;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .profile-card {
    background: rgba(255, 255, 255, 0.92);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 28px rgba(11, 116, 216, 0.25);
    border: 2px solid rgba(188, 223, 255, 0.5);
    backdrop-filter: blur(10px);
  }

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.8rem;
    padding-bottom: 1.2rem;
    border-bottom: 2px solid rgba(0, 102, 204, 0.2);
  }

  .profile-header h1 {
    color: #0066cc;
    margin: 0;
    font-weight: 700;
    font-size: 2rem;
  }

  .btn-edit {
    background: linear-gradient(135deg, #4ecbff, #0b74d8);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 118, 255, 0.3);
  }

  .btn-edit:hover {
    background: linear-gradient(135deg, #3bb5ff, #0056b3);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 118, 255, 0.4);
  }

  .avatar-display {
    text-align: center;
    margin-bottom: 1.8rem;
  }

  .avatar-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #4ecbff;
    box-shadow: 0 8px 24px rgba(11, 116, 216, 0.15);
  }

  .avatar-placeholder-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4ecbff 0%, #0b74d8 100%);
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: bold;
    border: 4px solid #4ecbff;
    box-shadow: 0 8px 24px rgba(11, 116, 216, 0.15);
  }

  .info-group {
    margin-bottom: 1.2rem;
  }

  .info-group label {
    display: block;
    font-weight: 700;
    color: #0066cc;
    margin-bottom: 0.4rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    color: #333;
    font-size: 1.1rem;
    padding: 1rem;
    background: rgba(208, 234, 255, 0.3);
    border-radius: 12px;
    border: 2px solid rgba(188, 223, 255, 0.5);
  }

  .form-group {
    margin-bottom: 1.2rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.4rem;
    font-size: 14px;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #bcdfff;
    border-radius: 12px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.3s ease;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #49b3ff;
    box-shadow: 0 0 0 3px rgba(73, 179, 255, 0.25);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 70px;
  }

  .current-avatar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(208, 234, 255, 0.3);
    border-radius: 12px;
    border: 2px solid rgba(188, 223, 255, 0.5);
  }

  .avatar-medium {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }

  .password-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(208, 234, 255, 0.3);
    border-radius: 12px;
    border: 2px solid rgba(188, 223, 255, 0.5);
  }

  .btn-toggle-password {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;
    border: none;
    padding: 0.7rem 1.3rem;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn-toggle-password:hover {
    background: linear-gradient(135deg, #7f8c8d 0%, #6c757d 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .password-fields {
    margin-top: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid #e0e0e0;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 1rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #4ecbff, #0b74d8);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 118, 255, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #3bb5ff, #0056b3);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 118, 255, 0.4);
  }

  .btn-primary:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-secondary {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn-secondary:hover {
    background: linear-gradient(135deg, #7f8c8d 0%, #6c757d 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }

  .btn-danger:disabled {
    background: #f8d7da;
    color: #721c24;
    cursor: not-allowed;
  }

  .danger-zone {
    margin-top: 3rem;
    padding: 1.5rem;
    background: rgba(254, 178, 178, 0.15);
    border: 3px solid rgba(254, 178, 178, 0.5);
    border-radius: 15px;
  }

  .danger-zone h3 {
    color: #c53030;
    margin-top: 0;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .danger-warning {
    color: #856404;
    background: rgba(255, 243, 205, 0.8);
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    border: 1px solid rgba(255, 193, 7, 0.5);
  }

  .message {
    padding: 1rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    text-align: center;
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message.error {
    background: linear-gradient(135deg, rgba(248, 215, 218, 0.95) 0%, rgba(220, 53, 69, 0.1) 100%);
    color: #721c24;
    border: 2px solid #f5c6cb;
  }

  .message.success {
    background: linear-gradient(135deg, rgba(212, 237, 218, 0.95) 0%, rgba(40, 167, 69, 0.1) 100%);
    color: #155724;
    border: 2px solid #c3e6cb;
  }

  .error-message {
    color: #dc3545;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  /* Username validation styles */
  .form-group input.checking {
    border-color: #95a5a6;
  }

  .form-group input.error {
    border-color: #dc3545;
  }

  .form-group input.success {
    border-color: #28a745;
  }

  .status-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem;
    border-radius: 8px;
    display: inline-block;
  }

  .status-message.checking {
    color: #6c757d;
    background: rgba(108, 117, 125, 0.1);
    border: 1px solid rgba(108, 117, 125, 0.2);
  }

  .status-message.error {
    color: #dc3545;
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.2);
  }

  .status-message.success {
    color: #28a745;
    background: rgba(40, 167, 69, 0.1);
    border: 1px solid rgba(40, 167, 69, 0.2);
  }

  .status-message.info {
    color: #0066cc;
    background: rgba(0, 102, 204, 0.1);
    border: 1px solid rgba(0, 102, 204, 0.2);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: rgba(255, 255, 255, 0.98);
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 102, 204, 0.3);
    border: 3px solid rgba(188, 223, 255, 0.5);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .modal-header h2 {
    color: #dc3545;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: #666;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 30px;
    height: 30px;
  }

  .close-btn:hover {
    color: #333;
  }

  .modal-body {
    margin-bottom: 1.5rem;
  }

  .warning-text {
    background: rgba(254, 178, 178, 0.2);
    color: #c53030;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid rgba(220, 53, 69, 0.3);
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .confirm-instruction {
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .username-display {
    background: rgba(0, 102, 204, 0.1);
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
    margin-bottom: 1rem;
    color: #0066cc;
    font-size: 1.1rem;
  }

  .confirm-input {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    margin-top: 1rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    .profile-card {
      padding: 1.5rem;
    }

    .profile-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .form-actions {
      flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
    }
  }
</style>
