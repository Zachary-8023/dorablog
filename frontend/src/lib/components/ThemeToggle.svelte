<script>
  import { onMount } from "svelte";

  let currentTheme = "light";

  onMount(() => {
    // initial theme setup
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      currentTheme = savedTheme;
    } else {
      // first visit, default to light theme
      currentTheme = "light";
      localStorage.setItem("theme", "light");
    }

    // sync theme state
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  });

  function toggleTheme() {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }

  function setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
    currentTheme = theme;
  }
</script>

<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
  {#if currentTheme === "dark"}
    <!-- click to switch to dark mode -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        stroke="currentColor"
        stroke-width="2"
      />
      <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path
        d="M4.93 4.93L6.34 6.34"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M17.66 17.66L19.07 19.07"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path
        d="M6.34 17.66L4.93 19.07"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M19.07 4.93L17.66 6.34"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  {:else}
    <!-- click to switch to light mode -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  {/if}
</button>

<style>
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
</style>
