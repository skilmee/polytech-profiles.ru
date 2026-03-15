const profileMapGrid = document.getElementById("profileMapGrid");

const PROFILE_MAP_STRUCTURE = [
  {
    title: "Данные",
    description: "Профили, связанные с аналитикой, обработкой данных и интеллектуальными системами.",
    profiles: [
      "Искусственный интеллект и машинное обучение",
      "Большие и открытые данные"
    ]
  },
  {
    title: "Разработка",
    description: "Профили, ориентированные на программирование, архитектуру решений и прикладную разработку.",
    profiles: [
      "Веб-технологии",
      "Программное обеспечение информационных систем",
      "Разработка инженерного программного обеспечения",
      "Системная и программная инженерия",
      "Разработка и интеграция бизнес-приложений"
    ]
  },
  {
    title: "Безопасность",
    description: "Профили, связанные с защитой инфраструктуры, анализом уязвимостей и безопасностью систем.",
    profiles: [
      "Информационная безопасность",
      "Информационная безопасность автоматизированных систем"
    ]
  },
  {
    title: "Устройства",
    description: "Профили, в которых важны встроенные системы, электроника, робототехника и аппаратная интеграция.",
    profiles: [
      "Интеллектуальные беспилотные системы",
      "Информационные системы умных пространств",
      "Программирование электронных устройств и систем"
    ]
  },
  {
    title: "Бизнес-системы",
    description: "Профили, ориентированные на корпоративные решения, цифровизацию процессов и прикладные системы организаций.",
    profiles: [
      "Автоматизированные системы обработки информации и управления",
      "Информационные технологии управления бизнесом",
      "Корпоративные решения на платформе 1С"
    ]
  },
  {
    title: "Креативные технологии",
    description: "Профили на стыке программирования, визуальных интерфейсов, игр, XR и цифровых медиа.",
    profiles: [
      "Информационные технологии в креативных индустриях",
      "Программное обеспечение игровой компьютерной индустрии",
      "Технологии дополненной и виртуальной реальности"
    ]
  }
];

function findProfileByName(profileName) {
  for (const program of programs) {
    const profile = program.profiles.find(item => item.name === profileName);
    if (profile) {
      return { program, profile };
    }
  }

  return null;
}

function buildMapProfileItem(profileName) {
  const found = findProfileByName(profileName);

  if (!found) {
    return `
      <button class="map-profile-chip" type="button" disabled>
        ${profileName}
      </button>
    `;
  }

  return `
    <button
      class="map-profile-chip"
      type="button"
      data-program-code="${found.program.code}"
      data-profile-name="${found.profile.name}"
    >
      ${found.profile.name}
    </button>
  `;
}

function renderProfileMap() {
  if (!profileMapGrid) return;

  profileMapGrid.innerHTML = PROFILE_MAP_STRUCTURE.map(zone => `
    <article class="map-zone-card">
      <div class="map-zone-top">
        <div class="map-zone-badge">${zone.profiles.length}</div>
        <h3>${zone.title}</h3>
      </div>
      <p class="map-zone-description">${zone.description}</p>
      <div class="map-zone-list">
        ${zone.profiles.map(profileName => buildMapProfileItem(profileName)).join("")}
      </div>
    </article>
  `).join("");

  profileMapGrid.querySelectorAll(".map-profile-chip").forEach(button => {
    button.addEventListener("click", () => {
      const profileName = button.dataset.profileName;
      const programCode = button.dataset.programCode;

      const program = programs.find(item => item.code === programCode);
      if (!program) return;

      const profile = program.profiles.find(item => item.name === profileName);
      if (!profile) return;

      if (typeof openModal === "function") {
        openModal(profile, program);
      }
    });
  });
}

renderProfileMap();