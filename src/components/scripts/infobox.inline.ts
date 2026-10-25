// Hide infobox images whose files haven't been uploaded yet, instead of showing a broken icon.
function hideMissingImages() {
  for (const img of document.querySelectorAll<HTMLImageElement>(".infobox img")) {
    const hide = () => {
      const holder = (img.closest("figure") ?? img) as HTMLElement;
      holder.style.display = "none";
      // If that was the last visible image in its row, hide the row too.
      const row = img.closest("tr");
      if (row && ![...row.querySelectorAll<HTMLElement>("figure, img")].some((el) => el.style.display !== "none")) {
        row.style.display = "none";
      }
    };
    if (img.complete && img.naturalWidth === 0) hide();
    else {
      img.addEventListener("error", hide, { once: true });
      window.addCleanup?.(() => img.removeEventListener("error", hide));
    }
  }
}

document.addEventListener("nav", hideMissingImages);
document.addEventListener("render", hideMissingImages);
