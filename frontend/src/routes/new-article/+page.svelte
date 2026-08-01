<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { api, API, getResourceUrl } from "$lib/api";
  import { userStore } from "$lib/session";
  import Editor from "@tinymce/tinymce-svelte";
  import { showError } from "$lib/toastStore.js";

  import Footer from "$lib/components/Footer.svelte";

  let isLoggedIn = false;
  let currentUser = null;

  let title = "";
  let content = "";
  let selectedTag = "";
  let headerImage = null;
  let uploadedImages = [];
  let contentImages = [];

  let isSubmitting = false;
  let errors = {};

  $: {
    isLoggedIn = !!$userStore;
    currentUser = $userStore;
  }

  onMount(() => {
    if (!isLoggedIn) {
      goto("/login");
    }
  });

  const availableTags = ["Technology", "Lifestyle", "Travel", "Health", "Entertainment", "News"];

  const editorConfig = {
    height: 400,
    menubar: "file edit view insert format",
    plugins:
      "image lists link anchor autolink charmap codesample emoticons media searchreplace table visualblocks wordcount",
    toolbar:
      "undo redo | blocks | bold italic underline | image link | bullist numlist | removeformat",
    content_style:
      "body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }",

    content_css: false,
    branding: false,
    promotion: false,

    images_upload_handler: async (blobInfo, progress) => {
      return new Promise(async (resolve, reject) => {
        try {
          if (uploadedImages.length >= 9) {
            reject("Maximum 9 images allowed. Please remove some images before uploading more.");
            return;
          }

          const file = blobInfo.blob();
          if (!file.type.startsWith("image/")) {
            reject("Please select an image file");
            return;
          }

          if (file.size > 10 * 1024 * 1024) {
            reject("File size must be less than 10MB");
            return;
          }

          const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
          const fileName = blobInfo.filename().toLowerCase();
          const fileExtension = fileName.substring(fileName.lastIndexOf("."));
          if (!allowedExtensions.includes(fileExtension)) {
            reject("Only JPG, PNG, GIF, and WebP images are allowed");
            return;
          }

          const formData = new FormData();
          formData.append("image", file, blobInfo.filename());

          const response = await fetch(`${API}/api/articles/upload-image`, {
            method: "POST",
            credentials: "include",
            body: formData
          });

          const result = await response.json();

          if (result.success) {
            const imageUrl = getResourceUrl(result.imageUrl);
            uploadedImages = [...uploadedImages, result.imageUrl];
            resolve(imageUrl);
          } else {
            reject("Upload failed: " + (result.error || "Unknown error"));
          }
        } catch (error) {
          reject("Upload failed: " + error.message);
        }
      });
    },

    image_advtab: false,
    image_title: false,
    image_description: false,
    image_dimensions: false,
    image_caption: false,

    paste_data_images: true,

    setup: (editor) => {
      editor.on("OpenWindow", (e) => {
        setTimeout(() => {
          const dialog = document.querySelector(".tox-dialog");
          if (dialog) {
            const formGroups = dialog.querySelectorAll(".tox-form__group");
            formGroups.forEach((group) => {
              const label = group.querySelector("label");
              if (label && label.textContent.toLowerCase().includes("class")) {
                group.style.display = "none";
              }
            });

            const tabs = dialog.querySelectorAll(".tox-dialog__body-nav-item");
            tabs.forEach((tab) => {
              const tabText = tab.textContent.toLowerCase();
              if (tabText.includes("upload")) {
                tab.click();
              }
            });
          }
        }, 10);
      });

      editor.on("NodeChange", (e) => {
        const images = editor.getBody().querySelectorAll("img:not([data-processed])");
        images.forEach((img) => {
          img.setAttribute("data-processed", "true");

          img.classList.add("thumbnail-image");

          const body = editor.getBody();
          const allImages = body.querySelectorAll("img.thumbnail-image");
          const textContent = editor.getContent({ format: "text" }).trim();

          if (allImages.length === 1) {
            const hasText = textContent && textContent.length > 0;

            if (!hasText) {
              const p = editor.getDoc().createElement("p");
              p.innerHTML = "<br>";
              body.insertBefore(p, body.firstChild);
            } else {
              const parent = img.parentNode;

              const imageContainer = editor.getDoc().createElement("p");

              if (parent) {
                parent.removeChild(img);
              }

              imageContainer.appendChild(img);

              body.appendChild(imageContainer);

              if (parent && parent.childNodes.length === 0 && parent.parentNode) {
                parent.parentNode.removeChild(parent);
              }
            }

            setTimeout(() => {
              const range = editor.getDoc().createRange();
              const sel = editor.selection.getSel();
              range.setStartAfter(img);
              range.setEndAfter(img);
              sel.removeAllRanges();
              sel.addRange(range);
              editor.focus();
            }, 10);
          } else {
            setTimeout(() => {
              const range = editor.getDoc().createRange();
              const sel = editor.selection.getSel();
              range.setStartAfter(img);
              range.setEndAfter(img);
              sel.removeAllRanges();
              sel.addRange(range);
              editor.focus();
            }, 10);
          }
        });
      });

      editor.on("init", () => {
        const style = editor.getDoc().createElement("style");
        style.textContent = `
          .thumbnail-image {
            width: 150px !important;
            height: 150px !important;
            object-fit: cover !important;
            display: inline-block !important;
            margin: 5px !important;
            border-radius: 8px !important;
            vertical-align: top !important;
          }
        `;
        editor.getDoc().head.appendChild(style);
      });
    }
  };

  // TinyMCE API key
  const apiKey = "z285vuatv7et9z4jdzehijd9c1gcajgfo9gbik4k63hpqqyf";

  $: user = $userStore;

  // onMount(() => {
  //   if (!user) {
  //     goto('/login');
  //   }
  // });

  function validateImage(file) {
    const errors = [];

    if (!file.type.startsWith("image/")) {
      errors.push("Please select an image file");
    }

    if (file.size > 10 * 1024 * 1024) {
      errors.push("File size must be less than 10MB");
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push("Only JPG, PNG, GIF, and WebP images are allowed");
    }

    return errors;
  }

  // Form validation
  function validateForm() {
    errors = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    } else if (title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (!content.trim()) {
      errors.content = "Content is required";
    } else if (content.length > 100000) {
      errors.content = "Content must be less than 100,000 characters";
    }

    if (!selectedTag) {
      errors.tag = "Please select a tag";
    }

    if (headerImage) {
      const imageErrors = validateImage(headerImage);
      if (imageErrors.length > 0) {
        errors.headerImage = imageErrors.join(", ");
      }
    }

    if (contentImages.length > 0) {
      for (let i = 0; i < contentImages.length; i++) {
        const imageErrors = validateImage(contentImages[i]);
        if (imageErrors.length > 0) {
          errors.contentImages = `Image ${i + 1}: ${imageErrors.join(", ")}`;
          break;
        }
      }
    }

    return Object.keys(errors).length === 0;
  }

  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content.trim();

      const images = tempDiv.querySelectorAll("img");
      images.forEach((img) => img.remove());

      const contentWithoutImages = tempDiv.innerHTML.trim();

      let headerImageUrl = null;
      if (headerImage) {
        const formData = new FormData();
        formData.append("image", headerImage);

        const uploadResponse = await fetch(`${API}/api/articles/upload-image`, {
          method: "POST",
          credentials: "include",
          body: formData
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          headerImageUrl = uploadResult.imageUrl;
        }
      }

      const articleData = {
        title: title.trim(),
        content: contentWithoutImages,
        tag: selectedTag,
        headerImage: headerImageUrl,
        contentImages: uploadedImages
      };

      const result = await api("/api/articles", {
        method: "POST",
        body: JSON.stringify(articleData)
      });

      goto(`/articles/${result.article.id}`);
    } catch (error) {
      console.error("API Error:", error);

      if (error.status === 401) {
        goto("/login");
      } else {
        errors.submit = error.message || "Failed to create article";
        showError(errors.submit);
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Handle header image upload with validation
  function handleHeaderImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const imageErrors = validateImage(file);
      if (imageErrors.length > 0) {
        errors.headerImage = imageErrors.join(", ");
        return;
      }
      headerImage = file;
      errors.headerImage = "";
    }
  }

  // Get tag color
  function getTagColor(tagName) {
    const colors = {
      Technology: "#3b82f6",
      Lifestyle: "#10b981",
      Travel: "#f59e0b",
      Health: "#ef4444",
      Entertainment: "#ec4899",
      News: "#6b7280"
    };
    return colors[tagName] || colors.News;
  }
</script>

<div class="new-article-page">
  <div class="container">
    <div class="header">
      <h1>Create New Article</h1>
      <p>Share your thoughts with the community</p>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="article-form">
      <!-- Article Title -->
      <div class="form-group">
        <label for="title">Article Title *</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Enter your article title..."
          class:error={errors.title}
          maxlength="200"
        />
        {#if errors.title}
          <span class="error-message">{errors.title}</span>
        {/if}
        <div class="char-count">{title.length}/200</div>
      </div>

      <!-- Tag Selection -->
      <div class="form-group">
        <label for="tag">Tag *</label>
        <div class="tag-selector">
          {#each availableTags as tag}
            <button
              type="button"
              class="tag-option"
              class:selected={selectedTag === tag}
              style="background-color: {getTagColor(tag)}"
              on:click={() => (selectedTag = tag)}
            >
              {#if selectedTag === tag}
                <span class="selected-indicator">✓</span>
              {/if}
              {tag}
            </button>
          {/each}
        </div>
        {#if errors.tag}
          <span class="error-message">{errors.tag}</span>
        {/if}
      </div>

      <!-- Header Image Upload -->
      <div class="form-group">
        <label for="header-image">Header Image (Max 1 Image)</label>
        <div class="image-upload">
          <input
            id="header-image"
            type="file"
            accept="image/*"
            on:change={handleHeaderImageUpload}
            style="display: none;"
          />
          <label for="header-image" class="upload-button">
            {#if headerImage}
              <span>✓ {headerImage.name}</span>
            {:else}
              <span>📷 Upload Header Image</span>
            {/if}
          </label>
        </div>
        {#if errors.headerImage}
          <span class="error-message">{errors.headerImage}</span>
        {/if}
        {#if headerImage}
          <div class="image-preview">
            <img src={URL.createObjectURL(headerImage)} alt="Header preview" />
          </div>
        {/if}
      </div>

      <!-- Article Content -->
      <div class="form-group">
        <label for="content">Article Content *</label>
        <p class="helper-text">
          💡 Tip: Click the image button (🖼️) in the toolbar, or drag & drop images directly into
          the editor. Maximum 9 images.
        </p>
        <div class="editor-container" class:error={errors.content}>
          <Editor bind:value={content} conf={editorConfig} {apiKey} />
        </div>
        {#if errors.content}
          <span class="error-message">{errors.content}</span>
        {/if}
        <div class="char-count">{content.length}/100,000</div>
      </div>

      <!-- Submit Error -->
      {#if errors.submit}
        <div class="submit-error">{errors.submit}</div>
      {/if}

      <!-- Action Buttons -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" on:click={() => goto("/")}> Cancel </button>
        <button type="submit" class="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Publishing..." : "Publish Article"}
        </button>
      </div>
    </form>
  </div>
</div>

<Footer />

<style>
  .new-article-page {
    min-height: calc(100vh - 120px);
    padding: 0.5rem 0 4rem 0;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .header {
    text-align: center;
    margin-bottom: 1rem;
    color: #2c3e50;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    padding: 0.8rem;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition:
      background 0.3s ease,
      box-shadow 0.3s ease;
  }

  [data-theme="dark"] .header {
    background: rgba(26, 32, 44, 0.8);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .header h1 {
    font-size: 2.2rem;
    margin-bottom: 0.2rem;
    font-weight: 700;
    color: #2c3e50;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header p {
    font-size: 1.1rem;
    color: #7f8c8d;
    opacity: 0.9;
    font-weight: 500;
  }

  .article-form {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition:
      background 0.3s ease,
      box-shadow 0.3s ease;
  }

  [data-theme="dark"] .article-form {
    background: rgba(26, 32, 44, 0.8);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  .helper-text {
    font-size: 0.85rem;
    color: #667eea;
    margin: -0.25rem 0 0.5rem 0;
    font-style: italic;
    background: #f0f4ff;
    padding: 0.5rem;
    border-radius: 6px;
    border-left: 3px solid #667eea;
  }

  .form-group input {
    width: 100%;
    padding: 0.7rem;
    border: 2px solid #e8ecf0;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .tag-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 0.5rem;
  }

  .tag-option {
    padding: 6px 12px;
    border: 2px solid transparent;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }

  .tag-option::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .tag-option:hover::before {
    left: 100%;
  }

  .tag-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .tag-option.selected {
    border: 3px solid #ffffff;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
  }

  .selected-indicator {
    display: inline-block;
    margin-right: 4px;
    font-size: 12px;
    font-weight: bold;
  }

  .form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  .form-group input.error {
    border-color: #e74c3c;
  }

  .error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  }

  .char-count {
    text-align: right;
    font-size: 0.875rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .editor-container {
    border: 2px solid #e8ecf0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .editor-container:hover {
    border-color: #d1d9e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .editor-container.error {
    border-color: #e74c3c;
  }

  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-width: 500px;
  }

  .upload-button {
    display: inline-block;
    padding: 0.5rem 0.8rem;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    font-size: 0.8rem;
  }

  .upload-button:hover {
    background: #e9ecef;
    border-color: #667eea;
  }

  .image-preview {
    margin-top: 0.5rem;
    max-width: 500px;
    display: flex;
    justify-content: center;
  }

  .image-preview img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .submit-error {
    background: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  }

  .form-actions {
    display: flex;
    gap: 0.8rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e1e5e9;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
    letter-spacing: 0.3px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .btn-secondary {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;
  }

  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4);
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 0.5rem;
    }

    .article-form {
      padding: 1.5rem;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
