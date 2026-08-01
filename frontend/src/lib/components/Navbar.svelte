<script>
  import { goto } from "$app/navigation";
  import LoginMenu from "./LoginMenu.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import bellIcon from "../../assets/images/bell.png";
  import newArticleIcon from "../../assets/images/NewArticles_icon.svg";
</script>

<nav class="navbar">
  <div class="nav-container">
    <div class="logo">
      <img src={bellIcon} alt="DoraBlog Logo" class="logo-image" />
      <span class="logo-text">DoraBlog</span>
    </div>

    <div class="nav-links">
      <button class="nav-link" on:click={() => goto("/")}><span>Home</span></button>
      <button class="nav-link" on:click={() => goto("/articles")}><span>Articles</span></button>
    </div>

    <div class="nav-actions">
      <button class="add-button" on:click={() => goto("/new-article")}>
        <img src={newArticleIcon} alt="New Article" class="add-icon" />
      </button>
      <button class="search-button" on:click={() => goto("/articles")} title="Search articles">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <ThemeToggle />
      <LoginMenu />
    </div>
  </div>
</nav>

<style>
  .navbar {
    background-color: var(--navbar-background, #d0eaff);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    box-shadow: 0 2px 4px var(--shadow-color, rgba(0, 0, 0, 0.1));
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    height: 60px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--navbar-text, #0066cc);
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-link {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: var(--navbar-text, #0066cc);
    padding: 0.5rem 0;
    transition: color 0.2s ease;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  .nav-link:hover {
    color: var(--navbar-hover, #003399);
  }

  .nav-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .add-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-button:hover {
    transform: scale(1.1);
  }

  .add-icon {
    width: 60px;
    height: 60px;
    object-fit: contain;
    filter: var(
      --add-icon-filter,
      brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(1419%) hue-rotate(184deg)
        brightness(95%) contrast(92%)
    );
  }

  .search-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--navbar-text, #0066cc);
    padding: 0.5rem;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-button:hover {
    color: var(--navbar-hover, #003399);
  }

  .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--navbar-text, #0066cc);
    padding: 0.5rem;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle:hover {
    color: var(--navbar-hover, #003399);
  }

  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      height: auto;
      padding: 1rem;
      gap: 1rem;
    }

    .nav-links {
      flex-wrap: wrap;
      gap: 1rem;
    }

    .nav-link {
      font-size: 0.9rem;
    }

    .nav-actions {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
