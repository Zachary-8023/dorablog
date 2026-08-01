<script>
  export let name = "Unknown";
  export let avatar = "/assets/images/avatar-placeholder.jpg";
</script>

<section class="card">
  <div class="row">
    <img class="avatar" src={avatar} alt={name} loading="lazy" />
    <div class="info">
      <div class="label">Author</div>
      <div class="name">{name}</div>
    </div>
  </div>
</section>

<style>
  .card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 12px;
    transition:
      background 0.3s ease,
      box-shadow 0.3s ease;
  }

  [data-theme="dark"] .card {
    background: rgba(26, 32, 44, 0.8);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }

  .label {
    color: #567;
    font-size: 0.82rem;
    opacity: 0.85;
  }

  .name {
    color: #103066;
    font-weight: 700;
    margin-top: 2px;
  }
</style>
