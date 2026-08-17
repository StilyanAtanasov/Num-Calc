(function () {
  const form = document.getElementById("pyramid-form");
  const input = document.getElementById("pyramid-date");
  const external = document.getElementById("external-pyramid");
  const internal = document.getElementById("internal-pyramid");

  function reducePair(left, right) {
    const sum = left + right;
    return sum > 9 ? sum - 9 : sum;
  }

  function buildPyramid(base) {
    const rows = [base];
    while (rows[rows.length - 1].length > 1) {
      const lowerRow = rows[rows.length - 1];
      const row = [];
      for (let index = 0; index < lowerRow.length - 1; index += 1) {
        row.push(reducePair(lowerRow[index], lowerRow[index + 1]));
      }
      rows.push(row);
    }
    return rows;
  }

  function renderPyramid(container, rows) {
    container.innerHTML = rows
      .map(
        (row) =>
          `<div class="pyramid-row">${row.map((number) => `<span class="pyramid-number">${number}</span>`).join("")}</div>`,
      )
      .join("");
  }

  function calculate() {
    if (!input.value) return;
    const [year, month, day] = input.value.split("-");
    const base = `${day}${month}${year}`.split("").map(Number);
    const invertedBase = base.map((number) => 9 - number);
    renderPyramid(external, buildPyramid(base));
    renderPyramid(internal, buildPyramid(invertedBase));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
  });
  input.addEventListener("change", calculate);
})();
