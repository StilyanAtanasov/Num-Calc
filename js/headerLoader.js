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
        attachMobileMenu();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        document.body.classList.remove("page-loading");
      });
  }

  function attachMobileMenu() {
    const menuToggle = document.getElementById("menu-toggle");
    const header = document.querySelector("header");
    if (!menuToggle || !header) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Затвори менюто" : "Отвори менюто");
    });

    header.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
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
