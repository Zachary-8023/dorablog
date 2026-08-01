<script>
  import { api } from "$lib/api";
  import PasswordStrengthIndicator from "$lib/components/PasswordStrengthIndicator.svelte";
  import AvatarSelector from "$lib/components/AvatarSelector.svelte";
  import { loadMe } from "$lib/session";

  let username = "",
    password = "",
    confirm = "",
    realname = "",
    birthdate = "",
    description = "";
  let busy = false,
    error = "",
    success = "",
    usernameError = "",
    passwordError = "";
  let usernameChecking = false,
    usernameAvailable = null;
  let selectedAvatar = "",
    customAvatarFile = null;

  // Check the uniqueness of the username in real time
  async function checkUsername() {
    if (!username || username.length < 3) {
      usernameError = "Username must be at least 3 characters";
      usernameAvailable = false;
      return;
    }

    // Username format validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameError = "Username can only contain letters, numbers, and underscores";
      usernameAvailable = false;
      return;
    }

    usernameChecking = true;
    usernameError = "";

    try {
      console.log("Checking username:", username);
      const data = await api(`/api/auth/registered?username=${encodeURIComponent(username)}`);
      console.log("API response:", data);

      if (data.registered) {
        usernameError = "Username already taken";
        usernameAvailable = false;
      } else {
        usernameError = "";
        usernameAvailable = true;
      }
    } catch (e) {
      console.error("Username check error:", e);
      console.error("Error details:", e.message);
      usernameError = `Unable to check username: ${e.message}`;
      usernameAvailable = false;
    } finally {
      usernameChecking = false;
    }
  }

  // Simplified password validation - only checks length
  function validatePassword(pwd) {
    if (pwd.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  }

  // Listen to password changes
  $: if (password) {
    passwordError = validatePassword(password);
  }

  // Debounce username checking
  let usernameTimeout;
  $: if (username) {
    clearTimeout(usernameTimeout);
    usernameTimeout = setTimeout(checkUsername, 500);
  }

  // Avatar selection handling
  function handleAvatarSelect(avatarId, file = null) {
    console.log("Avatar selected:", avatarId, file);
    selectedAvatar = avatarId;
    customAvatarFile = file;
    console.log("selectedAvatar set to:", selectedAvatar);
  }

  async function submit() {
    error = "";
    success = "";
    busy = true;

    // Validate password match
    if (password !== confirm) {
      error = "Passwords do not match";
      busy = false;
      return;
    }

    // Validate password strength
    if (passwordError) {
      error = passwordError;
      busy = false;
      return;
    }

    // Validate username availability
    if (!usernameAvailable) {
      error = "Please choose a different username";
      busy = false;
      return;
    }

    try {
      // Prepare registration data
      console.log("Registration - selectedAvatar:", selectedAvatar);
      const registerData = { username, password, confirm, realname, birthdate, description };

      // If there is a custom avatar file, upload the avatar first
      if (selectedAvatar === "custom" && customAvatarFile) {
        console.log("Uploading custom avatar...");
        const formData = new FormData();
        formData.append("avatar", customAvatarFile);

        const uploadResponse = await api("/api/auth/upload-avatar", {
          method: "POST",
          body: formData
        });

        registerData.avatar = uploadResponse.avatarUrl;
        console.log("Avatar uploaded:", uploadResponse.avatarUrl);
      } else if (selectedAvatar && selectedAvatar !== "custom") {
        // Use default avatar
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
          registerData.avatar = avatar.src;
          console.log("Using default avatar:", registerData.avatar);
        }
      }

      console.log("Registering user with data:", registerData);
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData)
      });

      // Registration successful, redirecting to login page
      success = "Registration successful! Redirecting to login...";
      setTimeout(() => (location.href = "/login"), 1000);
    } catch (e) {
      console.error("Registration error:", e);
      if (e.message) {
        error = e.message;
      } else if (e.status) {
        error = `Server error (${e.status}): ${e.statusText || "Unknown error"}`;
      } else {
        error = "Registration failed - please check your connection and try again";
      }
    } finally {
      busy = false;
    }
  }
</script>

<div class="auth-page">
  <div class="overlay"></div>
  <div class="auth-card">
    <div class="card-header">
      <button class="home-btn" on:click={() => (location.href = "/")} aria-label="Back to Home">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 22V12H15V22"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h2>Register DoraBlog</h2>
    </div>
    <form on:submit|preventDefault={submit}>
      <!-- Username input -->
      <div class="input-group">
        <input
          placeholder="username"
          bind:value={username}
          class:error={usernameError}
          class:success={usernameAvailable}
          required
        />
        {#if usernameChecking}
          <div class="status-text checking">Checking...</div>
        {/if}
        {#if usernameError}
          <div class="status-text error-text">{usernameError}</div>
        {/if}
        {#if usernameAvailable}
          <div class="status-text success-text">✓ Username available</div>
        {/if}
      </div>

      <!-- Password input -->
      <div class="input-group">
        <input
          type="password"
          placeholder="password"
          bind:value={password}
          class:error={passwordError}
          required
        />
        {#if passwordError}
          <div class="status-text error-text">{passwordError}</div>
        {/if}
        {#if password && !passwordError}
          <div class="status-text success-text">✓ Password is valid</div>
        {/if}
      </div>

      <!-- Password strength indicator component -->
      <PasswordStrengthIndicator {password} />

      <!-- Confirm password -->
      <div class="input-group">
        <input
          type="password"
          placeholder="confirm password"
          bind:value={confirm}
          class:error={confirm && password !== confirm}
          required
        />
        {#if confirm && password !== confirm}
          <div class="status-text error-text">Passwords do not match</div>
        {/if}
        {#if confirm && password === confirm && password}
          <div class="status-text success-text">✓ Passwords match</div>
        {/if}
      </div>

      <!-- Avatar selection -->
      <div class="input-group">
        <div class="field-label">Avatar (optional)</div>
        <AvatarSelector bind:selectedAvatar onAvatarSelect={handleAvatarSelect} />
      </div>

      <!-- Other information -->
      <input placeholder="real name (optional)" bind:value={realname} />
      <input placeholder="birthdate (optional, e.g. 2000-01-01)" bind:value={birthdate} />
      <textarea placeholder="About me (optional)" bind:value={description}></textarea>

      {#if error}<p class="msg error">{error}</p>{/if}
      {#if success}<p class="msg success">{success}</p>{/if}
      <button
        class="btn"
        type="submit"
        disabled={busy || !usernameAvailable || passwordError || password !== confirm}
      >
        {busy ? "Registering..." : "Register"}
      </button>
    </form>
    <a class="switch" href="/login">Already have an account? Log in</a>
  </div>
</div>

<style>
  .auth-page {
    min-height: 100vh;
    background: url("/background.jpg") center/cover no-repeat fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 40px 0;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(3px);
    z-index: 0;
  }

  .auth-card {
    position: relative;
    z-index: 1;
    width: min(520px, 90vw);
    padding: 36px 30px 32px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 10px 28px rgba(11, 116, 216, 0.25);
    text-align: center;
  }

  .card-header {
    position: relative;
    margin-bottom: 18px;
  }

  .home-btn {
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #bcdfff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #0b74d8;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(11, 116, 216, 0.15);
  }

  .home-btn:hover {
    background: #e7f4ff;
    border-color: #49b3ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(11, 116, 216, 0.25);
  }

  h2 {
    color: #0b74d8;
    font-weight: 700;
    margin: 0;
    text-align: center;
  }

  .input-group {
    position: relative;
    margin: 12px 0;
  }

  /* Avatar selection special styles */
  .input-group:has(.avatar-selector) {
    margin: 16px 0;
    padding: 14px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    border: 1px solid rgba(11, 116, 216, 0.1);
    backdrop-filter: blur(10px);
  }

  /* Avatar selection special styles */
  .input-group :global(.avatar-selector .avatar-preview) {
    width: 90px;
    height: 90px;
    margin-bottom: 12px;
  }

  .input-group :global(.avatar-selector .avatar-controls) {
    margin-bottom: 8px;
  }

  .input-group :global(.avatar-selector .btn-select),
  .input-group :global(.avatar-selector .btn-clear) {
    padding: 8px 16px;
    font-size: 13px;
  }

  .input-group :global(.avatar-selector .avatar-option) {
    min-height: 65px;
    padding: 4px;
  }

  .input-group :global(.avatar-selector .avatar-option img) {
    width: 54px;
    height: 54px;
  }

  .input-group :global(.avatar-selector .avatar-grid) {
    gap: 8px;
    padding: 4px;
    margin-bottom: 12px;
  }

  .input-group :global(.avatar-selector .avatar-options) {
    padding: 10px;
    margin-top: 10px;
  }

  .input-group :global(.avatar-selector .avatar-options h4) {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .input-group :global(.avatar-selector .custom-upload) {
    padding-top: 10px;
  }

  .input-group :global(.avatar-selector .upload-btn) {
    padding: 7px 14px;
    font-size: 12px;
  }

  .field-label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 500;
  }

  /* Status text - fix overlap issue */
  .status-text {
    margin-top: 4px;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 4px;
    text-align: center;
  }

  .status-text.error-text {
    color: #d40000;
    background: rgba(212, 0, 0, 0.1);
    border: 1px solid rgba(212, 0, 0, 0.2);
  }

  .status-text.success-text {
    color: #009944;
    background: rgba(0, 153, 68, 0.1);
    border: 1px solid rgba(0, 153, 68, 0.2);
  }

  .status-text.checking {
    color: #666;
    background: rgba(102, 102, 102, 0.1);
    border: 1px solid rgba(102, 102, 102, 0.2);
    font-style: italic;
  }

  input,
  textarea {
    width: 100%;
    margin: 6px 0;
    padding: 10px 12px;
    border: 1px solid #bcdfff;
    border-radius: 12px;
    outline: none;
    font-size: 14px;
    font-family: inherit;
    font-weight: 400;
    line-height: 1.5;
    transition: all 0.3s ease;
  }

  textarea {
    resize: vertical;
    min-height: 70px;
  }

  input:focus,
  textarea:focus {
    border-color: #49b3ff;
    box-shadow: 0 0 0 3px rgba(73, 179, 255, 0.25);
  }

  /* Error state */
  input.error {
    border-color: #d40000;
    box-shadow: 0 0 0 3px rgba(212, 0, 0, 0.25);
  }

  /* Success state */
  input.success {
    border-color: #009944;
    box-shadow: 0 0 0 3px rgba(0, 153, 68, 0.25);
  }

  .btn {
    width: 100%;
    padding: 11px;
    margin-top: 10px;
    border: none;
    border-radius: 12px;
    font-weight: bold;
    font-size: 15px;
    color: white;
    background: linear-gradient(135deg, #4ecbff, #0b74d8);
    box-shadow: 0 8px 18px rgba(0, 118, 255, 0.25);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 12px 28px rgba(0, 118, 255, 0.35);
  }

  .switch {
    display: block;
    margin-top: 14px;
    color: #0b74d8;
    text-decoration: none;
    font-size: 14px;
  }

  .msg.error {
    color: #d40000;
  }
  .msg.success {
    color: #009944;
  }
</style>
