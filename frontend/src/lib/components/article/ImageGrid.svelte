<script>
  import { getResourceUrl } from "../../api.js";

  export let images = [];
</script>

<div class="grid-wrap">
  <div class="grid">
    {#each images as src, i}
      <figure class="cell" aria-label={`image-${i + 1}`}>
        <img src={getResourceUrl(src)} alt={`image-${i + 1}`} loading="lazy" />
      </figure>
    {/each}
  </div>
</div>

<style>
  .grid-wrap {
    width: 80%;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .cell {
    background: #eaf2ff;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    box-shadow: inset 0 0 0 1px rgba(120, 150, 200, 0.25);
  }

  .cell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.18s ease;
  }

  .cell:hover img {
    transform: scale(1.03);
  }
</style>
