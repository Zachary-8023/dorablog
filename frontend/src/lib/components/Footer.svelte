<footer class="footer">
  <div class="footer-container">
    <p class="copyright">@2025 BlueCatFour</p>
  </div>
</footer>

<style>
  .footer {
    /* glass effect */
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.65) 0%,
      rgba(255, 255, 255, 0.45) 100%
    );
    backdrop-filter: blur(22px) saturate(150%);
    -webkit-backdrop-filter: blur(22px) saturate(150%);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow:
      0 -2px 32px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    min-height: 60px;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .copyright {
    color: #0066cc;
    font-size: 0.9rem;
    margin: 0;
  }

  /* Dark Mode */
  :global([data-theme="dark"]) .footer {
    background: linear-gradient(180deg, rgba(26, 32, 44, 0.65) 0%, rgba(26, 32, 44, 0.45) 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 -2px 32px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  :global([data-theme="dark"]) .copyright {
    color: #60a5fa;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .footer-container {
      padding: 1rem;
    }

    .copyright {
      font-size: 0.8rem;
    }
  }
</style>
