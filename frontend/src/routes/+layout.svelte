<script>
  import "$lib/css/app.css";
  import { onMount } from "svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import ToastContainer from "$lib/components/ToastContainer.svelte";

  import { page } from "$app/stores";
  $: path = $page.url.pathname;

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }
  });
</script>

<Navbar />
<slot />
<ToastContainer />
