const compareProfile1 = document.getElementById("compareProfile1");
const compareProfile2 = document.getElementById("compareProfile2");
const compareProfile3 = document.getElementById("compareProfile3");
const compareBtn = document.getElementById("compareBtn");
const resetCompareBtn = document.getElementById("resetCompareBtn");
const compareResult = document.getElementById("compareResult");

const COMPARE_RATING_LABELS = {
  programming: "Программирование",
  math: "Математика",
  engineering: "Инженерность",
  applied: "Прикладность",
  research: "Исследовательский потенциал"
};

function flattenProfiles() {
  const list = [];

  programs.forEach(program => {
    program.profiles.forEach(profile => {
      list.push({
        code: program.code,
        programName: program.name,
        profile
      });
    });
  });

  return list;
}

const allProfilesForCompare = flattenProfiles();

function getCompareType(profile) {
  if (typeof profile.type === "string") return profile.type;
  if (profile.graduateModel && typeof profile.graduateModel.type === "string") {
    return profile.graduateModel.type;
  }
  return "Не указано";
}

function fillCompareSelects() {
  const placeholder = `<option value="">Не выбрано</option>`;

  const options = allProfilesForCompare.map((item, index) => {
    return `<option value="${index}">${item.code} — ${item.profile.name}</option>`;
  }).join("");

  [compareProfile1, compareProfile2, compareProfile3].forEach(select => {
    if (select) {
      select.innerHTML = placeholder + options;
    }
  });
}

function getProfileByIndex(index) {
  return allProfilesForCompare[Number(index)];
}

function getSelectedProfiles() {
  const values = [
    compareProfile1?.value,
    compareProfile2?.value,
    compareProfile3?.value
  ].filter(value => value !== "");

  const uniqueValues = new Set(values);

  if (values.length !== uniqueValues.size) {
    return { error: "Для сравнения нужно выбрать разные профили." };
  }

  if (values.length < 2) {
    return { error: "Выберите как минимум два профиля." };
  }

  return {
    data: values.map(value => getProfileByIndex(value))
  };
}

function compareRatings(profileItems) {
  return Object.keys(COMPARE_RATING_LABELS).map(key => ({
    key,
    label: COMPARE_RATING_LABELS[key],
    values: profileItems.map(item => item.profile.rating?.[key] ?? "—")
  }));
}

function buildDifferenceText(profileItems) {
  const differences = [];

  const ratingPairs = [
    { key: "programming", label: "программирование" },
    { key: "math", label: "математическую подготовку" },
    { key: "engineering", label: "инженерную составляющую" },
    { key: "applied", label: "прикладную направленность" },
    { key: "research", label: "исследовательскую направленность" }
  ];

  ratingPairs.forEach(item => {
    const prepared = profileItems.map(profileItem => ({
      name: profileItem.profile.name,
      value: profileItem.profile.rating?.[item.key] ?? 0
    })).sort((a, b) => b.value - a.value);

    if (prepared.length >= 2 && prepared[0].value > prepared[1].value) {
      differences.push(`По параметру «${item.label}» сильнее выражен профиль «${prepared[0].name}».`);
    }
  });

  if (!differences.length) {
    differences.push("Профили близки по ключевым оценкам и требуют более детального содержательного сравнения.");
  }

  return differences.slice(0, 5);
}

function buildCompareCard(item) {
  return `
    <article class="compare-card">
      <div class="compare-card-program">${item.code} — ${item.programName}</div>
      <h3>${item.profile.name}</h3>
      <p>${item.profile.description || "Описание профиля не указано."}</p>
      <div class="compare-card-type">${getCompareType(item.profile)}</div>
    </article>
  `;
}

function buildList(items) {
  if (!Array.isArray(items) || !items.length) {
    return "<li>Информация не указана.</li>";
  }

  return items.map(item => `<li>${item}</li>`).join("");
}

function buildGridTemplate(columnsCount) {
  return `repeat(${columnsCount}, minmax(0, 1fr))`;
}

function renderCompareCards(profileItems) {
  return `
    <div class="compare-cards" style="grid-template-columns: ${buildGridTemplate(profileItems.length)};">
      ${profileItems.map(item => buildCompareCard(item)).join("")}
    </div>
  `;
}

function renderRatingTable(profileItems, ratingRows) {
  const columnsTemplate = `1.6fr repeat(${profileItems.length}, minmax(0, 1fr))`;

  return `
    <section class="compare-section">
      <h3>Сравнение по ключевым характеристикам</h3>
      <div class="compare-table">
        <div class="compare-row head" style="grid-template-columns: ${columnsTemplate};">
          <div>Параметр</div>
          ${profileItems.map(item => `<div>${item.profile.name}</div>`).join("")}
        </div>
        ${ratingRows.map(row => `
          <div class="compare-row" style="grid-template-columns: ${columnsTemplate};">
            <div>${row.label}</div>
            ${row.values.map(value => `<div>${value}/10</div>`).join("")}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCompareColumns(title, profileItems, fieldName) {
  return `
    <section class="compare-section">
      <h3>${title}</h3>
      <div class="compare-columns" style="grid-template-columns: ${buildGridTemplate(profileItems.length)};">
        ${profileItems.map(item => `
          <div class="compare-card">
            <div class="compare-subtitle">${item.profile.name}</div>
            <ul>${buildList(item.profile[fieldName])}</ul>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderComparison() {
  const selected = getSelectedProfiles();

  compareResult.style.display = "block";

  if (selected.error) {
    compareResult.innerHTML = `
      <div class="compare-difference-item">
        ${selected.error}
      </div>
    `;
    return;
  }

  const profileItems = selected.data;
  const ratingRows = compareRatings(profileItems);
  const differences = buildDifferenceText(profileItems);

  compareResult.innerHTML = `
    ${renderCompareCards(profileItems)}

    ${renderRatingTable(profileItems, ratingRows)}

    <section class="compare-section">
      <h3>Ключевые различия</h3>
      <div class="compare-difference-list">
        ${differences.map(item => `<div class="compare-difference-item">${item}</div>`).join("")}
      </div>
    </section>

    ${renderCompareColumns("Кому подойдёт", profileItems, "suitable")}
    ${renderCompareColumns("Кому не подойдёт", profileItems, "notSuitable")}
  `;
}

function resetComparison() {
  if (compareProfile1) compareProfile1.value = "";
  if (compareProfile2) compareProfile2.value = "";
  if (compareProfile3) compareProfile3.value = "";

  if (compareResult) {
    compareResult.style.display = "none";
    compareResult.innerHTML = "";
  }
}

fillCompareSelects();

if (compareBtn) {
  compareBtn.addEventListener("click", renderComparison);
}

if (resetCompareBtn) {
  resetCompareBtn.addEventListener("click", resetComparison);
}