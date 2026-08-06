(function () {
  const engine = window.NumerologyEngine;
  const wheel = document.getElementById("wheel");
  const summary = document.getElementById("wheel-summary");
  const details = document.getElementById("wheel-details");
  const buildButton = document.getElementById("build-composite");
  const resetButton = document.getElementById("reset-wheel");

  if (!engine || !wheel || !buildButton) {
    return;
  }

  const segments = [
    { id: "first", title: "Първа част", label: "Дата 1" },
    { id: "second", title: "Втора част", label: "Дата 2" },
    { id: "third", title: "Трета част", label: "Дата 3" },
    { id: "fourth", title: "Четвърта част", label: "Дата 4" },
  ];

  const state = {
    profiles: [],
    openSegment: null,
  };

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

  function renderWheel() {
    wheel.innerHTML = segments
      .map((segment, index) => {
        const profile = state.profiles[index];
        const dateValue = profile
          ? `${String(profile.year).padStart(4, "0")}-${String(profile.month).padStart(2, "0")}-${String(profile.day).padStart(2, "0")}`
          : "";
        const isOpen = state.openSegment === index;
        const hasProfile = Boolean(profile);
        const cardClass = `segment-card${hasProfile ? "" : " empty-segment"}${isOpen ? " open" : ""}`;

        let mini = "";
        if (profile) {
          const { highlighted } = engine.getHighlightedConnections(
            profile.numbersPresent,
          );
          const pathMarkup = highlighted
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

          mini = `<div class="month-scheme"><div class="lead">${profile.leadNumber}</div><svg viewBox="0 0 100 100" preserveAspectRatio="none">${pathMarkup}</svg></div>`;
        }

        return `
          <section class="segment">
            <div class="${cardClass}" data-segment="${index}">
              <div class="segment-controls">
                <h3>${segment.title}</h3>
                ${hasProfile || isOpen ? "" : `<button class="plus" type="button" data-seg="${index}" title="Добави дата">+</button>`}
              </div>
              ${hasProfile ? `<p>${profile.label}</p>` : `<p class="empty-state">Празен сегмент</p>`}
              ${isOpen ? `<input class="segment-date" type="date" data-date-index="${index}" value="${dateValue}" />` : ""}
              ${profile ? mini : ""}
            </div>
          </section>`;
      })
      .join("");

    wheel.querySelectorAll(".plus").forEach((button) => {
      button.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const idx = Number(button.getAttribute("data-seg"));
        state.openSegment = idx;
        renderWheel();
      });
    });

    wheel.querySelectorAll(".segment-card.empty-segment").forEach((card) => {
      card.addEventListener("click", () => {
        const idx = Number(card.getAttribute("data-segment"));
        state.openSegment = idx;
        renderWheel();
      });
    });

    wheel.querySelectorAll('input[type="date"]').forEach((input) => {
      input.addEventListener("change", () => {
        const idx = Number(input.getAttribute("data-date-index"));
        const val = input.value;
        if (!val) return;
        try {
          const profile = engine.createProfileFromDate(val);
          state.profiles[idx] = profile;
          state.openSegment = null;
          renderWheel();
        } catch (e) {
          alert(e.message || "Невалидна дата");
        }
      });
    });
  }

  function renderComposite() {
    if (state.profiles.length < 4 || state.profiles.some((value) => !value)) {
      summary.textContent = "Запълнете всички четири сегмента.";
      details.innerHTML = "";
      return;
    }

    const composite = engine.buildCompositeProfile(state.profiles);
    const { highlighted, special } = engine.getHighlightedConnections(
      composite.numbersPresent,
    );
    summary.textContent = `Финална схема • Главно число ${composite.leadNumber}`;
    details.innerHTML = `
      <div class="result-row"><span>Общо налични числа</span><span>${composite.numbersPresent.join(", ") || "—"}</span></div>
      <div class="result-row"><span>Подчертани линии</span><span>${highlighted.length}</span></div>
      <div class="result-row"><span>Специални комбинации</span><span>${special.length}</span></div>
    `;

    // draw composite visual (only lead number + connection lines)
    function positionForNode(value) {
      const mapping = {
        1: { x: 10, y: 12 },
        2: { x: 50, y: 12 },
        3: { x: 90, y: 12 },
        4: { x: 10, y: 50 },
        5: { x: 50, y: 50 },
        6: { x: 90, y: 50 },
        7: { x: 10, y: 88 },
        8: { x: 50, y: 88 },
        9: { x: 90, y: 88 },
      };
      return mapping[value];
    }

    const pathMarkup = highlighted
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

    // keep input segments visible; render final composite into the details box next to inputs
    details.innerHTML = `
      <div class="result-row"><span>Общо налични числа</span><span>${composite.numbersPresent.join(", ") || "—"}</span></div>
      <div class="result-row"><span>Подчертани линии</span><span>${highlighted.length}</span></div>
      <div class="result-row"><span>Специални комбинации</span><span>${special.length}</span></div>
    `;

    // render a larger composite visualization using the same SVG style as monthly maps
    const compositeContainer = document.getElementById("composite-matrix");
    if (compositeContainer) {
      compositeContainer.innerHTML = `
        <div class="month-scheme composite-scheme">
          <div class="lead">${composite.leadNumber}</div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">${pathMarkup}</svg>
        </div>
      `;
    }
  }

  buildButton.addEventListener("click", renderComposite);

  resetButton.addEventListener("click", () => {
    state.profiles = [];
    renderWheel();
    summary.textContent = "Запълнете всички четири сегмента.";
    details.innerHTML = "";
  });

  renderWheel();
})();
