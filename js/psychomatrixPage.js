(function () {
  const engine = window.NumerologyEngine;
  const wheel = document.getElementById("wheel");
  const summary = document.getElementById("wheel-summary");
  const details = document.getElementById("wheel-details");
  const buildButton = document.getElementById("build-composite");
  const resetButton = document.getElementById("reset-wheel");

  if (!engine || !wheel || !buildButton) return;

  const state = {
    profiles: [null, null, null, null],
    openSegment: null,
  };

  // Node position coordinates for 3x3 grid layout (1-4-7, 2-5-8, 3-6-9)
  function positionForNode(value) {
    const mapping = {
      1: { x: 15, y: 15 },
      4: { x: 50, y: 15 },
      7: { x: 85, y: 15 },

      2: { x: 15, y: 50 },
      5: { x: 50, y: 50 },
      8: { x: 85, y: 50 },

      3: { x: 15, y: 85 },
      6: { x: 50, y: 85 },
      9: { x: 85, y: 85 },
    };
    return mapping[value];
  }

  // Helper to render dots and layer-sorted SVG lines
  function renderSvgScheme(numbersPresent, highlighted) {
    const typePriority = { normal: 1, special: 2, cross: 3, full: 4 };
    const sortedHighlighted = [...highlighted].sort((a, b) => {
      const typeA = a.connectionType || "normal";
      const typeB = b.connectionType || "normal";
      return (typePriority[typeA] || 1) - (typePriority[typeB] || 1);
    });

    const dotsMarkup = numbersPresent
      .map((num) => {
        const pos = positionForNode(num);
        return `<circle cx="${pos.x}" cy="${pos.y}" r="3" class="matrix-node-dot" fill="#60a5fa" opacity="0.95" />`;
      })
      .join("");

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

    return `${dotsMarkup}${pathMarkup}`;
  }

  function renderWheel() {
    wheel.innerHTML = state.profiles
      .map((profile, index) => {
        const isOpen = state.openSegment === index;
        const hasProfile = Boolean(profile);
        const cardClass = `segment-card${hasProfile ? " has-profile" : ""}`;

        let content = "";
        if (isOpen) {
          const currentDate = profile
            ? `${String(profile.year).padStart(4, "0")}-${String(profile.month).padStart(2, "0")}-${String(profile.day).padStart(2, "0")}`
            : "";
          content = `
            <input class="segment-date" type="date" data-date-index="${index}" value="${currentDate}" autoFocus />
            ${profile ? `<span class="selected-date-label">${profile.label}</span>` : ""}
          `;
        } else if (hasProfile) {
          const { highlighted } = engine.getHighlightedConnections(
            profile.numbersPresent,
          );
          const svgMarkup = renderSvgScheme(
            profile.numbersPresent,
            highlighted,
          );
          content = `
            <div class="map-scheme">
              <div class="lead">${profile.leadNumber}</div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">${svgMarkup}</svg>
            </div>
            <span class="selected-date-label">${profile.label}</span>`;
        } else {
          content = `<button class="plus-btn" type="button" data-seg="${index}" title="Добави дата">+</button>`;
        }

        return `
          <section class="segment">
            <div class="${cardClass}" data-segment="${index}">
              ${content}
            </div>
          </section>`;
      })
      .join("");

    // Setup Listeners
    wheel.querySelectorAll(".plus-btn").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        state.openSegment = Number(btn.getAttribute("data-seg"));
        renderWheel();
      });
    });

    wheel.querySelectorAll('input[type="date"]').forEach((input) => {
      input.addEventListener("change", () => {
        const idx = Number(input.getAttribute("data-date-index"));
        if (!input.value) return;
        try {
          state.profiles[idx] = engine.createProfileFromDate(input.value);
          state.openSegment = null;
          renderWheel();
        } catch (e) {
          alert(e.message || "Невалидна дата");
        }
      });
    });
  }

  function renderComposite() {
    if (state.profiles.some((p) => !p)) {
      summary.textContent = "Запълнете всички четири сегмента.";
      details.innerHTML = "";
      return;
    }

    const composite = engine.buildCompositeProfile(state.profiles);
    const { highlighted, special } = engine.getCompositeHighlightedConnections(
      state.profiles,
    );

    summary.textContent = `Финална схема • Главно число ${composite.leadNumber}`;

    // Format new combinations list as individual chips
    const newCombosMarkup =
      special.length > 0
        ? `<div class="new-combinations-list">
            ${special.map((triplet) => `<span class="new-combination-chip">${triplet.join("-")}</span>`).join("")}
           </div>`
        : "<span>Няма нови</span>";

    details.innerHTML = `
      <div class="result-row"><span>Общо налични числа</span><span>${composite.numbersPresent.sort((a, b) => a - b).join(", ") || "—"}</span></div>
      <div class="result-row" style="flex-direction: column; align-items: flex-start; gap: 0.3rem;">
        <span>Нови комбинации</span>
        ${newCombosMarkup}
      </div>
    `;

    // Render Square Composite Canvas with larger centered lead number
    const compositeContainer = document.getElementById("composite-matrix");
    if (compositeContainer) {
      const svgMarkup = renderSvgScheme(composite.numbersPresent, highlighted);
      compositeContainer.innerHTML = `
        <div class="composite-container">
          <div class="lead">${composite.leadNumber}</div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">${svgMarkup}</svg>
        </div>
      `;
    }
  }

  buildButton.addEventListener("click", renderComposite);

  resetButton.addEventListener("click", () => {
    state.profiles = [null, null, null, null];
    state.openSegment = null;
    renderWheel();
    summary.textContent = "Запълнете всички четири сегмента.";
    details.innerHTML = "";
    const compositeContainer = document.getElementById("composite-matrix");
    if (compositeContainer) compositeContainer.innerHTML = "";
  });

  renderWheel();
})();
