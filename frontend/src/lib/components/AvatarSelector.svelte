<script>
  export let selectedAvatar = "";
  export let onAvatarSelect = () => {};

  // Default avatar option (image)
  const defaultAvatars = [
    { id: "avatar-leo", src: "/avatars/avatar-leo.png", name: "Blue Cat 1" },
    { id: "avatar-stevenshi", src: "/avatars/avatar-stevenshi.png", name: "Blue Cat 2" },
    { id: "avatar-xuan", src: "/avatars/avatar-xuan.png", name: "Blue Cat 3" },
    { id: "avatar-zhongwei", src: "/avatars/avatar-zhongwei.png", name: "Blue Cat 4" },
    { id: "doraemon1", src: "/avatars/doraemon1.png", name: "Doraemon 1" },
    { id: "doraemon2", src: "/avatars/doraemon2.png", name: "Doraemon 2" },
    { id: "doraemon3", src: "/avatars/doraemon3.png", name: "Doraemon 3" },
    { id: "doraemon4", src: "/avatars/doraemon4.png", name: "Doraemon 4" }
  ];

  let showSelector = false;
  let customFile = null;

  function selectDefaultAvatar(avatarId) {
    selectedAvatar = avatarId;
    showSelector = false;
    onAvatarSelect(avatarId);
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      // validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      customFile = file;
      selectedAvatar = "custom";
      showSelector = false;
      onAvatarSelect("custom", file);
    }
  }

  function clearSelection() {
    selectedAvatar = "";
    customFile = null;
    onAvatarSelect("");
  }
</script>

<div class="avatar-selector">
  <div class="avatar-preview">
    {#if selectedAvatar === "custom" && customFile}
      <img src={URL.createObjectURL(customFile)} alt="Custom avatar" />
    {:else if selectedAvatar}
      {@const avatar = defaultAvatars.find((a) => a.id === selectedAvatar)}
      {#if avatar}
        <img src={avatar.src} alt={avatar.name} />
      {/if}
    {:else}
      <div class="no-avatar">No Avatar</div>
    {/if}
  </div>

  <div class="avatar-controls">
    <button type="button" class="btn-select" on:click={() => (showSelector = !showSelector)}>
      {selectedAvatar ? "Change Avatar" : "Select Avatar"}
    </button>
    {#if selectedAvatar}
      <button type="button" class="btn-clear" on:click={clearSelection}>Clear</button>
    {/if}
  </div>

  {#if showSelector}
    <div class="avatar-options">
      <h4>Choose Default Avatar:</h4>
      <div class="avatar-grid">
        {#each defaultAvatars as avatar}
          <button
            type="button"
            class="avatar-option"
            class:selected={selectedAvatar === avatar.id}
            on:click={() => selectDefaultAvatar(avatar.id)}
            aria-label={`Select ${avatar.name} avatar`}
          >
            <img src={avatar.src} alt={avatar.name} />
          </button>
        {/each}
      </div>

      <div class="custom-upload">
        <h4>Or Upload Your Own:</h4>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          on:change={handleFileUpload}
          class="file-input"
        />
        <label for="avatar-upload" class="upload-btn">Choose File</label>
      </div>
    </div>
  {/if}
</div>

<style>
  .avatar-selector {
    margin: 12px 0;
    max-width: 100%;
  }

  .avatar-preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid #4ecbff;
    overflow: hidden;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0f8ff 0%, #e7f4ff 100%);
    box-shadow: 0 8px 24px rgba(11, 116, 216, 0.15);
    transition: all 0.3s ease;
  }

  .avatar-preview:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(11, 116, 216, 0.25);
  }

  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  .no-avatar {
    color: #666;
    font-size: 14px;
    text-align: center;
    font-weight: 500;
  }

  .avatar-controls {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 12px;
  }

  .btn-select,
  .btn-clear {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .btn-select {
    background: linear-gradient(135deg, #0b74d8 0%, #49b3ff 100%);
    color: white;
  }

  .btn-select:hover {
    background: linear-gradient(135deg, #49b3ff 0%, #0b74d8 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(11, 116, 216, 0.3);
  }

  .btn-clear {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #d40000;
    border: 1px solid #ffb3b3;
  }

  .btn-clear:hover {
    background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
    border-color: #ff6b6b;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(212, 0, 0, 0.2);
  }

  .avatar-options {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-top: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 100%;
  }

  .avatar-options h4 {
    margin: 0 0 12px 0;
    color: #0b74d8;
    font-size: 14px;
    font-weight: 600;
  }

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    max-width: 100%;
    padding: 8px;
  }

  .avatar-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 3px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    min-height: 80px;
    aspect-ratio: 1;
    background: rgba(240, 248, 255, 0.5);
  }

  .avatar-option:hover {
    background: rgba(78, 203, 255, 0.2);
    border-color: #4ecbff;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(78, 203, 255, 0.25);
  }

  .avatar-option.selected {
    border-color: #0b74d8;
    background: rgba(11, 116, 216, 0.15);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(11, 116, 216, 0.35);
  }

  .avatar-option img {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    object-fit: cover;
    transition: all 0.3s ease;
    border: 3px solid rgba(78, 203, 255, 0.3);
  }

  .avatar-option:hover img {
    border-color: #4ecbff;
    transform: scale(1.05);
  }

  .avatar-option.selected img {
    border-color: #0b74d8;
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba(11, 116, 216, 0.4);
  }

  .custom-upload {
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
  }

  .file-input {
    display: none;
  }

  .upload-btn {
    display: inline-block;
    padding: 8px 16px;
    background: linear-gradient(135deg, #4ecbff, #0b74d8);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .upload-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(11, 116, 216, 0.3);
  }
</style>
