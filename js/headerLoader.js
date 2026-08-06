(function () {
  const headerPath = "header.html";
  const placeholderId = "shared-header";

  function loadHeader() {
    const headerPlaceholder = document.getElementById(placeholderId);
    if (!headerPlaceholder) {
      return;
    }

    fetch(headerPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load header: ${response.statusText}`);
        }
        return response.text();
      })
      .then((html) => {
        headerPlaceholder.outerHTML = html;
        attachThemeToggle();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        document.body.classList.remove("page-loading");
      });
  }

  function attachThemeToggle() {
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");

    if (!themeToggle) {
      return;
    }

    themeToggle.addEventListener("click", () => {
      const nextTheme =
        body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", nextTheme);
      localStorage.setItem("numerology-theme", nextTheme);
    });
  }

  const storedTheme = localStorage.getItem("numerology-theme");
  if (storedTheme) {
    document.body.setAttribute("data-theme", storedTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHeader);
  } else {
    loadHeader();
  }
})();
