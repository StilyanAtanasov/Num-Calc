(function () {
  const engine = window.NumerologyEngine;
  const monthInput = document.getElementById("month-input");
  const calculateButton = document.getElementById("calculate-month");
  const clearButton = document.getElementById("clear-month");
  const summary = document.getElementById("month-summary");
  const results = document.getElementById("month-results");

  if (!engine || !monthInput || !calculateButton) {
    return;
  }

  function render(profiles) {
    const label = monthInput.value;
    summary.textContent = `Показани са ${profiles.length} дати за ${label || "избрания месец"}`;

    function positionForNode(value) {
      const mapping = {
        1: { x: 10, y: 12 },
        4: { x: 50, y: 12 },
        7: { x: 90, y: 12 },

        2: { x: 10, y: 50 },
        5: { x: 50, y: 50 },
        8: { x: 90, y: 50 },

        3: { x: 10, y: 88 },
        6: { x: 50, y: 88 },
        9: { x: 90, y: 88 },
      };
      return mapping[value];
    }

    results.innerHTML = profiles
      .map((profile) => {
        const { highlighted, special, isFullMap } =
          engine.getHighlightedConnections(profile.numbersPresent);

        const dotsMarkup = profile.numbersPresent
          .map((num) => {
            const pos = positionForNode(num);
            return `<circle cx="${pos.x}" cy="${pos.y}" r="3" class="matrix-node-dot" />`;
          })
          .join("");

        const typePriority = {
          normal: 1,
          special: 2,
          cross: 3,
          full: 4,
        };

        const sortedHighlighted = [...highlighted].sort((a, b) => {
          const typeA = a.connectionType || "normal";
          const typeB = b.connectionType || "normal";
          return (typePriority[typeA] || 1) - (typePriority[typeB] || 1);
        });

        const pathMarkup = sortedHighlighted
          .map((entry) => {
            const [from, to] = entry.nodes;
            const start = positionForNode(from);
            const end = positionForNode(to);
            const className = entry.connectionType
              ? `matrix-connection ${entry.connectionType}`
              : "matrix-connection normal";
            return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" class="${className}" />`;
          })
          .join("");

        return `
          <article class="month-card">
            <div class="month-scheme">
              <div class="lead">${profile.leadNumber}</div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">${dotsMarkup}${pathMarkup}</svg>
            </div>
            <strong>${profile.label}</strong>
          </article>
        `;
      })
      .join("");
  }

  calculateButton.addEventListener("click", () => {
    const [year, month] = monthInput.value
      .split("-")
      .map((item) => Number(item));
    if (!monthInput.value) {
      summary.textContent = "Моля, изберете месец.";
      return;
    }

    const profiles = engine.createMonthProfiles(year, month);
    render(profiles);
  });

  clearButton.addEventListener("click", () => {
    monthInput.value = "";
    summary.textContent = "Изберете месец, за да започнете.";
    results.innerHTML = "";
  });
})();
