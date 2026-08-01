<script>
  import { toasts } from "$lib/toastStore.js";
  import Toast from "./Toast.svelte";

  function removeToast(id) {
    toasts.update((items) => items.filter((item) => item.id !== id));
  }
</script>

<div class="toast-container">
  {#each $toasts as toast (toast.id)}
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={() => removeToast(toast.id)}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9999;
    pointer-events: none;
  }

  .toast-container :global(.toast) {
    pointer-events: auto;
    margin-bottom: 10px;
  }
</style>
