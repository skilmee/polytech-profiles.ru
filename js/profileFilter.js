const interestDirection = document.getElementById("interestDirection");
const mathPreference = document.getElementById("mathPreference");
const studyPreference = document.getElementById("studyPreference");
const filterProfilesBtn = document.getElementById("filterProfilesBtn");
const resetProfilesBtn = document.getElementById("resetProfilesBtn");
const filterResult = document.getElementById("filterResult");

function flattenProgramProfiles() {
  const items = [];

  programs.forEach(program => {
    program.profiles.forEach(profile => {
      items.push({
        program,
        profile
      });
    });
  });

  return items;
}

const allProgramProfiles = flattenProgramProfiles();

function getProfileTypeSafe(profile) {
  if (typeof profile.type === "string") return profile.type;
  if (profile.graduateModel && typeof profile.graduateModel.type === "string") {
    return profile.graduateModel.type;
  }
  return "Не указано";
}

function getInterestScore(profile, interest) {
  const rating = profile.rating || {};

  switch (interest) {
    case "programming":
      return (rating.programming || 0) * 2 + (rating.applied || 0);
    case "data":
      return (rating.math || 0) + (rating.research || 0) + (
        /данн|аналит|машин|интеллект|нейрон|статист/i.test(
          `${profile.description} ${(profile.stack || []).join(" ")}`
        ) ? 4 : 0
      );
    case "security":
      return /безопас|уязвим|крипт|защит/i.test(
        `${profile.name} ${profile.description} ${(profile.stack || []).join(" ")}`
      ) ? 12 : 0;
    case "hardware":
      return /микроконтрол|электрон|встроенн|схем|устрой|аппарат/i.test(
        `${profile.name} ${profile.description} ${(profile.stack || []).join(" ")}`
      ) ? 12 : 0;
    case "business":
      return /бизнес|корпоратив|1с|информационн систем|процесс/i.test(
        `${profile.name} ${profile.description} ${(profile.stack || []).join(" ")}`
      ) ? 12 : 0;
    case "creative":
      return /график|игр|xr|виртуаль|дополненн|интерфейс|медиа|креатив/i.test(
        `${profile.name} ${profile.description} ${(profile.stack || []).join(" ")}`
      ) ? 12 : 0;
    case "systems":
      return (rating.engineering || 0) * 2 + (rating.programming || 0);
    default:
      return 0;
  }
}

function matchesMathPreference(profile, mathLevel) {
  const value = profile.rating?.math ?? 0;

  if (!mathLevel) return true;
  if (mathLevel === "low") return value <= 5;
  if (mathLevel === "medium") return value >= 4 && value <= 7;
  if (mathLevel === "high") return value >= 7;

  return true;
}

function matchesStudyPreference(profile, studyType) {
  const rating = profile.rating || {};

  if (!studyType) return true;
  if (studyType === "applied") return (rating.applied || 0) >= 8;
  if (studyType === "engineering") return (rating.engineering || 0) >= 7;
  if (studyType === "research") return (rating.research || 0) >= 6;

  return true;
}

function filterProfiles() {
  const interest = interestDirection.value;
  const mathLevel = mathPreference.value;
  const studyType = studyPreference.value;

  let results = allProgramProfiles.filter(item => {
    return matchesMathPreference(item.profile, mathLevel) &&
           matchesStudyPreference(item.profile, studyType);
  });

  if (interest) {
    results = results
      .map(item => ({
        ...item,
        interestScore: getInterestScore(item.profile, interest)
      }))
      .filter(item => item.interestScore > 0)
      .sort((a, b) => b.interestScore - a.interestScore);
  } else {
    results = results.sort((a, b) => {
      const aApplied = a.profile.rating?.applied || 0;
      const bApplied = b.profile.rating?.applied || 0;
      return bApplied - aApplied;
    });
  }

  return results.slice(0, 6);
}

function renderFilterResults() {
  const results = filterProfiles();

  filterResult.style.display = "block";

  if (!results.length) {
    filterResult.innerHTML = `
      <div class="filter-result-empty">
        По выбранным условиям подходящих профилей не найдено. Попробуйте ослабить фильтры или убрать одно из ограничений.
      </div>
    `;
    return;
  }

  filterResult.innerHTML = `
    <div class="filter-result-grid">
      ${results.map(item => `
        <article class="filter-result-card">
          <div class="filter-result-program">${item.program.code} — ${item.program.name}</div>
          <h3>${item.profile.name}</h3>
          <p>${item.profile.description || "Описание профиля не указано."}</p>
          <div class="filter-result-type">${getProfileTypeSafe(item.profile)}</div>

          <div class="filter-result-meta">
            <span class="filter-badge">Программирование: ${item.profile.rating?.programming ?? "—"}/10</span>
            <span class="filter-badge">Математика: ${item.profile.rating?.math ?? "—"}/10</span>
            <span class="filter-badge">Инженерность: ${item.profile.rating?.engineering ?? "—"}/10</span>
            <span class="filter-badge">Прикладность: ${item.profile.rating?.applied ?? "—"}/10</span>
          </div>

          <div class="filter-card-actions">
            <button class="secondary-btn" type="button" onclick='openModal(programs.find(p => p.code === "${item.program.code}").profiles.find(pr => pr.name === ${JSON.stringify(item.profile.name)}), programs.find(p => p.code === "${item.program.code}"))'>
              Открыть карточку
            </button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function resetProfileFilters() {
  interestDirection.value = "";
  mathPreference.value = "";
  studyPreference.value = "";
  filterResult.style.display = "none";
  filterResult.innerHTML = "";
}

if (filterProfilesBtn) {
  filterProfilesBtn.addEventListener("click", renderFilterResults);
}

if (resetProfilesBtn) {
  resetProfilesBtn.addEventListener("click", resetProfileFilters);
}