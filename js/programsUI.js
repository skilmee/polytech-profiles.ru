const container = document.getElementById("programsContainer");

let distributionChartInstance = null;
let activeModal = null;
let previousBodyOverflow = "";

function getProfileType(profile) {
  if (typeof profile.type === "string") return profile.type;
  if (profile.graduateModel && typeof profile.graduateModel.type === "string") {
    return profile.graduateModel.type;
  }
  return "Не указано";
}

function getProfileDistribution(profile) {
  return profile.distribution || profile.disciplineDistribution || {};
}

function getProfileRating(profile) {
  return profile.rating || profile.scores || {
    programming: "—",
    math: "—",
    engineering: "—",
    applied: "—",
    research: "—"
  };
}

function buildList(items) {
  if (!Array.isArray(items) || !items.length) {
    return "<li>Информация не указана.</li>";
  }

  return items.map(item => `<li>${item}</li>`).join("");
}

function buildProgramCards() {
  if (!container) return;

  programs.forEach(program => {
    const programBlock = document.createElement("div");
    programBlock.className = "accordion-item";

    const header = document.createElement("div");
    header.className = "accordion-header";
    header.innerHTML = `
      <div class="accordion-header-main">
        <div class="accordion-header-text">
          <h3>${program.code} — ${program.name}</h3>
          <p>Профилей: ${program.profiles.length}</p>
        </div>
        <span class="accordion-header-icon" data-accordion-icon>+</span>
      </div>
    `;

    const content = document.createElement("div");
    content.className = "accordion-content";

    program.profiles.forEach(profile => {
      const card = document.createElement("div");
      card.className = "profile-card";

      card.innerHTML = `
  <div class="profile-card-main">
    <div class="profile-card-text">
      <h4>${profile.name}</h4>
      <p>${profile.description || "Описание профиля не указано."}</p>
    </div>
    <div class="profile-card-link">Подробнее →</div>
  </div>
`;

      card.onclick = () => openModal(profile, program);
      content.appendChild(card);
    });

    header.onclick = () => {
      const isOpen = content.classList.contains("open");

      document.querySelectorAll(".accordion-content").forEach(item => {
        item.classList.remove("open");
      });

      document.querySelectorAll("[data-accordion-icon]").forEach(icon => {
        icon.textContent = "+";
      });

      if (!isOpen) {
        content.classList.add("open");
        header.querySelector("[data-accordion-icon]").textContent = "−";
      }
    };

    programBlock.appendChild(header);
    programBlock.appendChild(content);
    container.appendChild(programBlock);
  });
}

function openModal(profile, program) {
  closeModal();

  const rating = getProfileRating(profile);
  const distribution = getProfileDistribution(profile);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-window">
      <span class="modal-close" aria-label="Закрыть">&times;</span>

      <div class="modal-top">
        <p class="modal-program-label">${program.code} — ${program.name}</p>
        <h2>${profile.name}</h2>
        <p class="modal-description">${profile.description || "Описание профиля не указано."}</p>
      </div>

      <section class="modal-section">
        <h3>Тип выпускника</h3>
        <p>${getProfileType(profile)}</p>
      </section>

      <section class="modal-section">
        <h3>Технический стек</h3>
        <ul>${buildList(profile.stack)}</ul>
      </section>

      <section class="modal-section">
        <h3>Распределение дисциплин</h3>
        <div class="modal-chart-wrap">
          <canvas id="distributionChart"></canvas>
        </div>
      </section>

      <section class="modal-section">
        <h3>Оценка профиля</h3>
        <div class="rating-grid">
          <div class="rating-card">
            <div class="rating-label">Программирование</div>
            <div class="rating-value">${rating.programming}/10</div>
          </div>
          <div class="rating-card">
            <div class="rating-label">Математика</div>
            <div class="rating-value">${rating.math}/10</div>
          </div>
          <div class="rating-card">
            <div class="rating-label">Инженерность</div>
            <div class="rating-value">${rating.engineering}/10</div>
          </div>
          <div class="rating-card">
            <div class="rating-label">Прикладность</div>
            <div class="rating-value">${rating.applied}/10</div>
          </div>
          <div class="rating-card">
            <div class="rating-label">Исследовательский потенциал</div>
            <div class="rating-value">${rating.research}/10</div>
          </div>
        </div>
      </section>

      <section class="modal-section">
        <h3>Кому подойдёт</h3>
        <ul>${buildList(profile.suitable)}</ul>
      </section>

      <section class="modal-section">
        <h3>Кому не подойдёт</h3>
        <ul>${buildList(profile.notSuitable)}</ul>
      </section>

      <section class="modal-section">
        <h3>Преимущества</h3>
        <ul>${buildList(profile.strengths)}</ul>
      </section>

      <section class="modal-section">
        <h3>Потенциальные риски</h3>
        <ul>${buildList(profile.risks)}</ul>
      </section>

     
    </div>
  `;

  document.body.appendChild(modal);

  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  activeModal = modal;

  modal.querySelector(".modal-close").onclick = closeModal;

  modal.onclick = event => {
    if (event.target === modal) {
      closeModal();
    }
  };

  document.addEventListener("keydown", handleModalEscape);

  renderChart(distribution);
}

function closeModal() {
  if (!activeModal) return;

  if (distributionChartInstance) {
    distributionChartInstance.destroy();
    distributionChartInstance = null;
  }

  activeModal.remove();
  activeModal = null;
  document.body.style.overflow = previousBodyOverflow;
  document.removeEventListener("keydown", handleModalEscape);
}

function handleModalEscape(event) {
  if (event.key === "Escape") {
    closeModal();
  }
}

function splitLabel(label, maxLength = 18) {
  const cleaned = label.replace(" (%)", "").trim();

  const prepared = cleaned
    .replace(/-/g, "- ")
    .split(/\s+/)
    .filter(Boolean);

  const lines = [];
  let currentLine = "";

  prepared.forEach(word => {
    const normalizedWord = word.replace(/-\s?$/, "-");
    const testLine = currentLine ? `${currentLine} ${normalizedWord}` : normalizedWord;

    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = normalizedWord;
    }
  });

  if (currentLine) lines.push(currentLine.trim());

  return lines.map(line => line.replace(/-\s/g, "-"));
}

function renderChart(data) {
  const ctx = document.getElementById("distributionChart");
  if (!ctx) return;

  const isMobile = window.innerWidth < 768;
  const labels = Object.keys(data).map(label => splitLabel(label, isMobile ? 14 : 20));

  if (distributionChartInstance) {
    distributionChartInstance.destroy();
  }

  distributionChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "% от учебного плана",
          data: Object.values(data),
          backgroundColor: "rgba(59, 130, 246, 0.75)",
          borderColor: "#60a5fa",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: isMobile ? "y" : "x",
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#f1f5f9",
            boxWidth: 26,
            font: {
              size: isMobile ? 12 : 14
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: "#cbd5e1",
            callback: value => `${value}%`,
            font: {
              size: isMobile ? 11 : 13
            }
          },
          grid: {
            color: "rgba(148, 163, 184, 0.08)"
          }
        },
        y: {
          ticks: {
            color: "#cbd5e1",
            font: {
              size: isMobile ? 11 : 13
            }
          },
          grid: {
            color: "rgba(148, 163, 184, 0.08)"
          }
        }
      }
    }
  });

  ctx.parentElement.style.minHeight = isMobile ? "420px" : "360px";
}

buildProgramCards();
