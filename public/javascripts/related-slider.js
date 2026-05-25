const relatedSlider = document.querySelector(".related-slider");

if (relatedSlider) {
  const track = relatedSlider.querySelector(".related-slider-track");
  const prevButton = relatedSlider.querySelector(".related-slider-prev");
  const nextButton = relatedSlider.querySelector(".related-slider-next");

  function scrollRelatedProducts(direction) {
    const item = track.querySelector(".related-slider-item");
    if (!item) return;

    const scrollAmount = item.offsetWidth + 24;
    track.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  }

  prevButton.addEventListener("click", () => scrollRelatedProducts(-1));
  nextButton.addEventListener("click", () => scrollRelatedProducts(1));
}