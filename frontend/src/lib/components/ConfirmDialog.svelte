<script>
  import { createEventDispatcher } from "svelte";

  export let title = "Confirm";
  export let message = "Are you sure?";
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let type = "danger"; // 'danger', 'warning', 'info'

  const dispatch = createEventDispatcher();

  function handleConfirm() {
    dispatch("confirm");
  }

  function handleCancel() {
    dispatch("cancel");
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
</script>

<div class="dialog-backdrop" on:click={handleBackdropClick} role="presentation">
  <div
    class="dialog-container"
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-message"
  >
    <div class="dialog-header">
      <h3 id="dialog-title" class="dialog-title">{title}</h3>
    </div>

    <div class="dialog-body">
      <p id="dialog-message" class="dialog-message">{message}</p>
    </div>

    <div class="dialog-footer">
      <button class="dialog-btn cancel-btn" on:click={handleCancel}>
        {cancelText}
      </button>
      <button class="dialog-btn confirm-btn {type}" on:click={handleConfirm}>
        {confirmText}
      </button>
    </div>
  </div>
</div>

<style>
  .dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .dialog-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 480px;
    width: 90%;
    animation: slideUp 0.3s ease;
    overflow: hidden;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .dialog-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .dialog-body {
    padding: 20px 24px;
  }

  .dialog-message {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #4b5563;
  }

  .dialog-footer {
    padding: 16px 24px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .dialog-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn {
    background: #f3f4f6;
    color: #374151;
  }

  .cancel-btn:hover {
    background: #e5e7eb;
  }

  .confirm-btn {
    color: white;
    min-width: 100px;
  }

  .confirm-btn.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .confirm-btn.danger:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .confirm-btn.warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  .confirm-btn.warning:hover {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  .confirm-btn.info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .confirm-btn.info:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  /* Dark theme support */
  :global([data-theme="dark"]) .dialog-container {
    background: #1f2937;
  }

  :global([data-theme="dark"]) .dialog-header {
    border-bottom-color: #374151;
  }

  :global([data-theme="dark"]) .dialog-title {
    color: #f9fafb;
  }

  :global([data-theme="dark"]) .dialog-message {
    color: #d1d5db;
  }

  :global([data-theme="dark"]) .cancel-btn {
    background: #374151;
    color: #e5e7eb;
  }

  :global([data-theme="dark"]) .cancel-btn:hover {
    background: #4b5563;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .dialog-container {
      width: 95%;
      max-width: none;
    }

    .dialog-header {
      padding: 20px 20px 12px;
    }

    .dialog-title {
      font-size: 1.1rem;
    }

    .dialog-body {
      padding: 16px 20px;
    }

    .dialog-footer {
      padding: 12px 20px 20px;
      flex-direction: column-reverse;
    }

    .dialog-btn {
      width: 100%;
    }
  }
</style>
