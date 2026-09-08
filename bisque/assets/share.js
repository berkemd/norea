(() => {
  const button = document.querySelector("[data-share]");
  const copyButton = document.querySelector("[data-copy-link]");
  const status = document.querySelector("[data-share-status]");
  const fallback = document.querySelector("[data-share-fallback]");
  const input = fallback?.querySelector("input");
  if (!button || !copyButton || !status || !fallback || !input) return;

  const url = document.querySelector('link[rel="canonical"]').href;
  button.hidden = false;
  copyButton.hidden = false;
  fallback.hidden = true;

  async function copyLink() {
    input.value = url;
    fallback.hidden = false;
    status.textContent = button.dataset.fallback;
    input.focus();
    input.select();
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      fallback.hidden = true;
      status.textContent = button.dataset.copied;
    } catch {
      // The selectable link already works even when browser permission is denied.
    }
  }
  copyButton.addEventListener("click", copyLink);
  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "";
    fallback.hidden = true;
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: button.dataset.title,
            text: button.dataset.text,
            url,
          });
          return;
        } catch (error) {
          if (error.name === "AbortError") return;
        }
      }
      await copyLink();
    } finally {
      button.disabled = false;
    }
  });
})();
