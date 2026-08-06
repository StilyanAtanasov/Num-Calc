(function () {
  const storedTheme = localStorage.getItem("numerology-theme");
  if (storedTheme) {
    document.body.setAttribute("data-theme", storedTheme);
  }
})();
