<script>
  import { onMount } from "svelte";

  export let message = "";
  export let type = "info"; // 'success', 'error', 'warning', 'info'
  export let duration = 3000;
  export let onClose = () => {};

  let visible = false;

  onMount(() => {
    visible = true;

    if (duration > 0) {
      setTimeout(() => {
        visible = false;
        setTimeout(onClose, 300); // Wait for fade-out animation
      }, duration);
    }
  });

  function handleClose() {
    visible = false;
    setTimeout(onClose, 300);
  }
</script>

{#if visible}
  <div class="toast toast-{type}" class:visible role="alert">
    <div class="toast-content">
      <span class="toast-icon">
        {#if type === "success"}
          ✓
        {:else if type === "error"}
          ✕
        {:else if type === "warning"}
          ⚠
        {:else}
          ℹ
        {/if}
      </span>
      <span class="toast-message">{message}</span>
      <button class="toast-close" on:click={handleClose} aria-label="Close"> × </button>
    </div>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 300px;
    max-width: 500px;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.3s ease;
  }

  .toast.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toast-icon {
    font-size: 1.5rem;
    font-weight: bold;
    flex-shrink: 0;
  }

  .toast-message {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .toast-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .toast-close:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  /* Success style */
  .toast-success {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    color: white;
  }

  /* Error style */
  .toast-error {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: white;
  }

  /* Warning style */
  .toast-warning {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #78350f;
  }

  /* Info style */
  .toast-info {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: white;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .toast {
      top: 10px;
      right: 10px;
      left: 10px;
      min-width: auto;
      max-width: none;
    }
  }
</style>
