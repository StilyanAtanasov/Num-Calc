(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.NumerologyEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function reduceNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }

    let result = number;
    while (result > 9) {
      result -= 9;
    }
    return result;
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function validateDate(day, month, year) {
    const parsedDay = Number(day);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (
      ![parsedDay, parsedMonth, parsedYear].every((value) =>
        Number.isInteger(value),
      )
    ) {
      return { valid: false, message: "Датата трябва да е валидна." };
    }

    if (parsedMonth < 1 || parsedMonth > 12) {
      return { valid: false, message: "Месецът трябва да е между 1 и 12." };
    }

    if (parsedDay < 1) {
      return { valid: false, message: "Денят трябва да е положителен." };
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const maxDays = daysInMonth[parsedMonth - 1];
    if (parsedMonth === 2 && isLeapYear(parsedYear)) {
      if (parsedDay > 29) {
        return { valid: false, message: "Невалиден ден за февруари." };
      }
    } else if (parsedDay > maxDays) {
      return { valid: false, message: "Невалиден ден за избрания месец." };
    }

    return { valid: true };
  }

  function normalizeDateInput(input) {
    if (input instanceof Date && !Number.isNaN(input.getTime())) {
      return {
        day: input.getDate(),
        month: input.getMonth() + 1,
        year: input.getFullYear(),
      };
    }

    if (
      input &&
      typeof input === "object" &&
      "day" in input &&
      "month" in input &&
      "year" in input
    ) {
      return {
        day: Number(input.day),
        month: Number(input.month),
        year: Number(input.year),
      };
    }

    if (typeof input === "string") {
      const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        return {
          day: Number(match[3]),
          month: Number(match[2]),
          year: Number(match[1]),
        };
      }
    }

    return null;
  }

  function collectDigitCounts(values) {
    const counts = Array(9).fill(0);

    values.forEach((value) => {
      if (value === null || value === undefined) {
        return;
      }

      const text = String(value);
      for (const char of text) {
        const digit = Number(char);
        if (!Number.isNaN(digit) && digit > 0) {
          counts[digit - 1] += 1;
        }
      }
    });

    return counts;
  }

  function createProfileFromParts(day, month, year) {
    const validation = validateDate(day, month, year);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const parsedDay = Number(day);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);
    // Implement the user's specified calculation algorithm:
    // 1) take all digits from day(2), month(2), year(4) as strings, exclude zeros for raw digit counts
    // 2) compute group sums (date, month, year) by summing group digits then reducing (<10)
    // 3) include group sums in counts, include cross sums (date+year, year+month, date+month)
    // 4) leadNumber is reduce(dateGroup + monthGroup + yearGroup)

    const dayStr = String(parsedDay).padStart(2, "0");
    const monthStr = String(parsedMonth).padStart(2, "0");
    const yearStr = String(parsedYear).padStart(4, "0");

    const counts = Array(9).fill(0);

    // raw digits from full date, excluding zeros
    const allDigits = (dayStr + monthStr + yearStr).split("");
    allDigits.forEach((ch) => {
      const d = Number(ch);
      if (!Number.isNaN(d) && d !== 0) {
        counts[d - 1]++;
      }
    });

    function sumDigitsAndReduce(str) {
      const sum = String(str)
        .split("")
        .map((c) => Number(c) || 0)
        .reduce((s, v) => s + v, 0);
      return reduceNumber(sum);
    }

    const groupDate = sumDigitsAndReduce(dayStr);
    const groupMonth = sumDigitsAndReduce(monthStr);
    const groupYear = sumDigitsAndReduce(yearStr);

    if (groupDate > 0) counts[groupDate - 1]++;
    if (groupMonth > 0) counts[groupMonth - 1]++;
    if (groupYear > 0) counts[groupYear - 1]++;

    const crossDateYear = reduceNumber(groupDate + groupYear);
    const crossYearMonth = reduceNumber(groupYear + groupMonth);
    const crossDateMonth = reduceNumber(groupDate + groupMonth);

    if (crossDateYear > 0) counts[crossDateYear - 1]++;
    if (crossYearMonth > 0) counts[crossYearMonth - 1]++;
    if (crossDateMonth > 0) counts[crossDateMonth - 1]++;

    const leadNumber = reduceNumber(groupDate + groupMonth + groupYear);

    const numbersPresent = counts
      .map((c, i) => (c > 0 ? i + 1 : null))
      .filter((v) => v !== null);

    return {
      day: parsedDay,
      month: parsedMonth,
      year: parsedYear,
      label: `${dayStr}.${monthStr}.${yearStr}`,
      reducedDay: groupDate,
      reducedMonth: groupMonth,
      reducedYear: groupYear,
      dateMonthYear: reduceNumber(parsedDay + parsedMonth + parsedYear),
      dateMonth: reduceNumber(parsedDay + parsedMonth),
      dateYear: reduceNumber(parsedDay + parsedYear),
      monthYear: reduceNumber(parsedMonth + parsedYear),
      leadNumber,
      digitCounts: counts,
      numbersPresent,
    };
  }

  function createProfileFromDate(input) {
    const parsedDate = normalizeDateInput(input);
    if (!parsedDate) {
      throw new Error("Невалидна дата.");
    }

    return createProfileFromParts(
      parsedDate.day,
      parsedDate.month,
      parsedDate.year,
    );
  }

  function buildCompositeProfile(profiles) {
    const aggregatedCounts = Array(9).fill(0);
    const numbersPresent = [];

    profiles.forEach((profile) => {
      profile.digitCounts.forEach((count, index) => {
        aggregatedCounts[index] += count;
      });
      profile.numbersPresent.forEach((number) => {
        if (!numbersPresent.includes(number)) {
          numbersPresent.push(number);
        }
      });
    });

    const leadNumber = reduceNumber(
      profiles.reduce((sum, profile) => sum + profile.leadNumber, 0),
    );

    return {
      day: null,
      month: null,
      year: null,
      leadNumber,
      digitCounts: aggregatedCounts,
      numbersPresent,
      label: "Комбиниран резултат",
    };
  }

  function createMonthProfiles(year, month) {
    const safeYear = Number(year);
    const safeMonth = Number(month);
    const daysInMonth = new Date(safeYear, safeMonth, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return createProfileFromParts(day, safeMonth, safeYear);
    });
  }

  const connectionMatrix = [
    { nodes: [1, 4], kind: "line" },
    { nodes: [4, 7], kind: "line" },
    { nodes: [1, 2], kind: "line" },
    { nodes: [1, 5], kind: "diagonal-up" },
    { nodes: [4, 5], kind: "line" },
    { nodes: [7, 5], kind: "diagonal-down" },
    { nodes: [7, 8], kind: "line" },
    { nodes: [2, 5], kind: "line" },
    { nodes: [5, 8], kind: "line" },
    { nodes: [2, 3], kind: "line" },
    { nodes: [3, 5], kind: "diagonal-up" },
    { nodes: [5, 6], kind: "line" },
    { nodes: [9, 5], kind: "diagonal-down" },
    { nodes: [8, 9], kind: "line" },
    { nodes: [3, 6], kind: "line" },
    { nodes: [6, 9], kind: "line" },
  ];

  const specialTriplets = [
    [1, 2, 3],
    [1, 4, 7],
    [1, 5, 9],
    [2, 5, 8],
    [3, 5, 7],
    [3, 6, 9],
    [4, 5, 6],
    [7, 8, 9],
  ];

  function getHighlightedConnections(numbersPresent) {
    const highlighted = [];
    const isFullMap = [1, 2, 3, 4, 5, 6, 7, 8, 9].every((number) =>
      numbersPresent.includes(number),
    );

    const crossTripletA = [2, 5, 8];
    const crossTripletB = [4, 5, 6];
    const isCrossActive =
      !isFullMap &&
      crossTripletA.every((number) => numbersPresent.includes(number)) &&
      crossTripletB.every((number) => numbersPresent.includes(number));

    const activeSpecialTriplets = specialTriplets.filter((triplet) =>
      triplet.every((number) => numbersPresent.includes(number)),
    );

    function sortedKey(nodes) {
      return [...nodes].sort((a, b) => a - b).join(",");
    }

    const crossEdges = new Set([
      sortedKey([2, 5]),
      sortedKey([5, 8]),
      sortedKey([4, 5]),
      sortedKey([5, 6]),
    ]);

    connectionMatrix.forEach((entry) => {
      if (!entry.nodes.every((number) => numbersPresent.includes(number))) {
        return;
      }

      let connectionType = "normal";
      if (isFullMap) {
        connectionType = "full";
      } else if (isCrossActive && crossEdges.has(sortedKey(entry.nodes))) {
        connectionType = "cross";
      } else if (
        activeSpecialTriplets.some((triplet) =>
          entry.nodes.every((number) => triplet.includes(number)),
        )
      ) {
        connectionType = "special";
      }

      highlighted.push({ ...entry, connectionType, isFullMap });
    });

    return {
      highlighted,
      special: activeSpecialTriplets,
      isFullMap,
      isCrossActive,
    };
  }

  function getCompositeHighlightedConnections(individualProfiles) {
    // 1. Combine all present numbers across all profiles
    const compositeNumbers = Array.from(
      new Set(individualProfiles.flatMap((p) => p.numbersPresent)),
    );

    // Helper to standardise keys for arrays
    function sortedKey(nodes) {
      return [...nodes].sort((a, b) => a - b).join(",");
    }

    // 2. Collect all special triplets completed inside ANY single profile
    const singleTriplets = new Set();
    individualProfiles.forEach((profile) => {
      specialTriplets.forEach((triplet) => {
        if (triplet.every((num) => profile.numbersPresent.includes(num))) {
          singleTriplets.add(sortedKey(triplet));
        }
      });
    });

    // 3. Find triplets that exist in the composite map BUT were NOT complete in any single profile
    const compositeOnlySpecialTriplets = specialTriplets.filter((triplet) => {
      const isCompleteInComposite = triplet.every((num) =>
        compositeNumbers.includes(num),
      );
      const wasInSingle = singleTriplets.has(sortedKey(triplet));
      return isCompleteInComposite && !wasInSingle;
    });

    // 4. Get standard composite highlights
    const { highlighted, isFullMap, isCrossActive } =
      getHighlightedConnections(compositeNumbers);

    // Set of edge keys that belong to newly formed overlap triplets
    const validNewEdges = new Set();
    compositeOnlySpecialTriplets.forEach((triplet) => {
      // A triplet like [1, 4, 7] consists of edges: [1, 4], [4, 7], etc.
      connectionMatrix.forEach((entry) => {
        if (entry.nodes.every((node) => triplet.includes(node))) {
          validNewEdges.add(sortedKey(entry.nodes));
        }
      });
    });

    // 5. Process all matrix lines
    const finalHighlighted = highlighted.map((entry) => {
      const edgeKey = sortedKey(entry.nodes);

      // Full map and Red Cross keep their active connection types
      if (entry.connectionType === "full" || entry.connectionType === "cross") {
        return entry;
      }

      // A special line is ONLY highlighted if it's part of a NEWLY formed triplet
      if (validNewEdges.has(edgeKey)) {
        return { ...entry, connectionType: "special" };
      }

      // Otherwise, draw all active doubles (like 4-7, 8-9) as normal lines
      return { ...entry, connectionType: "normal" };
    });

    return {
      highlighted: finalHighlighted,
      special: compositeOnlySpecialTriplets,
      isFullMap,
      isCrossActive,
      numbersPresent: compositeNumbers,
    };
  }

  return {
    reduceNumber,
    validateDate,
    createProfileFromParts,
    createProfileFromDate,
    buildCompositeProfile,
    createMonthProfiles,
    getHighlightedConnections,
    getCompositeHighlightedConnections,
    connectionMatrix,
    specialTriplets,
  };
});
