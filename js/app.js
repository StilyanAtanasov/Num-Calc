(function () {
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme =
        body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", nextTheme);
      localStorage.setItem("numerology-theme", nextTheme);
    });
  }

  const storedTheme = localStorage.getItem("numerology-theme");
  if (storedTheme) {
    body.setAttribute("data-theme", storedTheme);
  }
})();
