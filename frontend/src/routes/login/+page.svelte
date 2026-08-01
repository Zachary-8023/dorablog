<script>
  import { api } from "$lib/api";
  import { loadMe } from "$lib/session";
  let username = "",
    password = "",
    busy = false,
    error = "",
    success = "";

  async function submit() {
    error = "";
    success = "";
    busy = true;
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      await loadMe();
      success = "Login successful, redirecting...";
      setTimeout(() => (location.href = "/"), 1000);
    } catch (e) {
      error = e.message || "Login failed";
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
      <h2>Login DoraBlog</h2>
    </div>
    <form on:submit|preventDefault={submit}>
      <input placeholder="username" bind:value={username} required />
      <input type="password" placeholder="password" bind:value={password} required />
      {#if error}<p class="msg error">{error}</p>{/if}
      {#if success}<p class="msg success">{success}</p>{/if}
      <button class="btn" type="submit" disabled={busy}>Login</button>
    </form>
    <a class="switch" href="/register">Don’t have an account yet? Register now.</a>
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
    width: min(420px, 90vw);
    padding: 40px 30px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 10px 28px rgba(11, 116, 216, 0.25);
    text-align: center;
  }

  .card-header {
    position: relative;
    margin-bottom: 24px;
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

  input {
    width: 100%;
    margin: 8px 0;
    padding: 12px;
    border: 1px solid #bcdfff;
    border-radius: 12px;
    outline: none;
    font-size: 14px;
  }

  input:focus {
    border-color: #49b3ff;
    box-shadow: 0 0 0 3px rgba(73, 179, 255, 0.25);
  }

  .btn {
    width: 100%;
    padding: 12px;
    margin-top: 12px;
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
    margin-top: 18px;
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
