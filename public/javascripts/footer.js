const footerGroups = document.querySelectorAll(".footer-group");
const desktopMediaQuery = window.matchMedia("(min-width: 640px)");

function updateFooterGroups() {
  footerGroups.forEach((group) => {
    if (desktopMediaQuery.matches) {
      group.open = true;
    } else {
      group.open = group.hasAttribute("data-open-mobile");
    }
  });
}

footerGroups.forEach((group) => {
  group.addEventListener("toggle", () => {
    if (desktopMediaQuery.matches && !group.open) {
      group.open = true;
    }
  });
});

desktopMediaQuery.addEventListener("change", updateFooterGroups);
updateFooterGroups();