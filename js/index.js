const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");

if (tilForm && tilList) {
  tilForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const dateInput = tilForm.querySelector("#til-date");
    const titleInput = tilForm.querySelector("#til-title");
    const contentInput = tilForm.querySelector("#til-content");

    const date = dateInput?.value?.trim();
    const title = titleInput?.value?.trim();
    const content = contentInput?.value?.trim();

    if (!date || !title || !content) return;

    const item = document.createElement("article");
    item.className = "til-item";

    const time = document.createElement("time");
    time.textContent = date;

    const h3 = document.createElement("h3");
    h3.textContent = title;

    const p = document.createElement("p");
    p.textContent = content;

    item.append(time, h3, p);

    // 최신 항목이 위로 오도록 prepend
    tilList.prepend(item);
    tilForm.reset();
  });
}

// 갤러리 이미지 hover 시 풀스크린 프리뷰
const galleryImages = document.querySelectorAll(".gallery-grid img");

let previewOverlay = null;
let previewImg = null;
let hideTimer = null;

function ensurePreviewOverlay() {
  if (previewOverlay) return;

  previewOverlay = document.createElement("div");
  previewOverlay.className = "image-preview-overlay";

  previewImg = document.createElement("img");
  previewImg.alt = "";

  previewOverlay.appendChild(previewImg);
  document.body.appendChild(previewOverlay);
}

function showPreview(src, altText) {
  ensurePreviewOverlay();
  if (!previewOverlay || !previewImg) return;

  previewImg.src = src;
  previewImg.alt = altText || "갤러리 이미지 전체 보기";

  previewOverlay.classList.add("is-visible");
}

function hidePreview() {
  if (!previewOverlay) return;
  previewOverlay.classList.remove("is-visible");
}

galleryImages.forEach((img) => {
  img.addEventListener("mouseenter", () => {
    showPreview(img.currentSrc || img.src, img.alt);
  });

  img.addEventListener("mouseleave", () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }
    hidePreview();
  });
});
