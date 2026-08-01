<script>
  // Layout shell for the article detail page
  import Footer from "$lib/components/Footer.svelte";

  export let data;

  const CONTENT_MAX = 1400;

  console.log("Layout loaded for article:", data.article?.title);
</script>

<div class="page-wrap">
  <!-- Main content slot -->
  <div class="content-bound" style={`max-width:${CONTENT_MAX}px;`}>
    <slot />
  </div>
</div>

<Footer />

<style>
  .page-wrap {
    position: relative;
    min-height: 100vh;
    padding-top: 5px;
  }

  .content-bound {
    position: relative;
    width: 100%;
    margin: 0 auto 60px;
    padding: 0 16px;
  }
</style>
