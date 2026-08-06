(function () {
  const engine = window.NumerologyEngine;
  const dateInput = document.getElementById("date-input");
  const calculateButton = document.getElementById("calculate-date");
  const clearButton = document.getElementById("clear-date");
  const summary = document.getElementById("date-summary");
  const results = document.getElementById("date-results");
  const matrixContainer = document.getElementById("matrix-container");
  const profileSummary = document.getElementById("profile-summary");

  if (!engine || !dateInput || !calculateButton) {
    return;
  }

  function renderMatrix(profile) {
    const numbersPresent = profile.numbersPresent;
    const { highlighted, special, isFullMap } =
      engine.getHighlightedConnections(numbersPresent);

    const nodes = [1, 4, 7, 2, 5, 8, 3, 6, 9];
    const nodeMarkup = nodes
      .map((value) => {
        const active = numbersPresent.includes(value);
        const count =
          (profile.digitCounts && profile.digitCounts[value - 1]) || 0;
        if (!active)
          return `<div class="matrix-node" data-active="false"></div>`;
        // render as many rings as the digit count (cap to 6 to avoid excessive overlap)
        const ringCount = Math.max(1, Math.min(6, count));
        let rings = "";
        for (let i = 0; i < ringCount; i++)
          rings += '<span class="ring"></span>';
        return `<div class="matrix-node" data-active="true">${rings}<span>${value}</span></div>`;
      })
      .join("");

    const typePriority = {
      normal: 1,
      special: 2,
      cross: 3,
      full: 4,
    };

    // Sort highlighted connections by priority before generating SVG HTML
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

    matrixContainer.innerHTML = `
      <div class="matrix-lead">${profile.leadNumber}</div>
      <svg class="matrix-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        ${pathMarkup}
      </svg>
      <div class="matrix-grid">${nodeMarkup}</div>
    `;
  }

  function positionForNode(value) {
    const mapping = {
      // Top Row (y = 15)
      1: { x: 15, y: 15 },
      4: { x: 50, y: 15 },
      7: { x: 85, y: 15 },

      // Middle Row (y = 50)
      2: { x: 15, y: 50 },
      5: { x: 50, y: 50 },
      8: { x: 85, y: 50 },

      // Bottom Row (y = 85)
      3: { x: 15, y: 85 },
      6: { x: 50, y: 85 },
      9: { x: 85, y: 85 },
    };
    return mapping[value];
  }

  function render(profile) {
    const items = [
      { label: "Дата", value: profile.label },
      { label: "Редуцирана дата", value: profile.reducedDay },
      { label: "Редуциран месец", value: profile.reducedMonth },
      { label: "Редуцирана година", value: profile.reducedYear },
      { label: "Главно число", value: profile.leadNumber },
    ];

    summary.textContent = `Изчислено за ${profile.label}`;
    results.innerHTML = items
      .map(
        (item) =>
          `<div class="result-row"><span>${item.label}</span><span>${item.value}</span></div>`,
      )
      .join("");

    const counts = profile.digitCounts || [];
    const countsMarkup = counts
      .map((cnt, idx) => ({ n: idx + 1, cnt }))
      .filter((it) => it.cnt > 0)
      .map(
        (it) =>
          `<div class="result-row"><span>Число ${it.n}</span><span>${it.cnt}</span></div>`,
      )
      .join("");

    profileSummary.innerHTML = `
      <div class="result-list">
        <div class="result-row"><span>Главно число</span><span>${profile.leadNumber}</span></div>
        ${countsMarkup || '<div class="result-row"><span>Налични числа</span><span>—</span></div>'}
      </div>
    `;

    renderMatrix(profile);
  }

  calculateButton.addEventListener("click", () => {
    const [year, month, day] = dateInput.value
      .split("-")
      .map((item) => Number(item));
    if (!dateInput.value) {
      summary.textContent = "Моля, изберете дата.";
      return;
    }

    const profile = engine.createProfileFromParts(day, month, year);
    render(profile);
  });

  clearButton.addEventListener("click", () => {
    dateInput.value = "";
    summary.textContent = "Изберете дата, за да започнете.";
    results.innerHTML = "";
    profileSummary.innerHTML =
      '<span class="empty-state">Все още няма данни.</span>';
    matrixContainer.innerHTML = '<div class="empty-state">Изберете дата.</div>';
  });
})();
