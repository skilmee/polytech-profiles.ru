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
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;">
        <div>
          <h3>${program.code} — ${program.name}</h3>
          <p style="margin-top:10px;color:#94a3b8;">
            Профилей: ${program.profiles.length}
          </p>
        </div>
        <div style="font-size:22px;color:#22d3ee;line-height:1;">+</div>
      </div>
    `;

    const content = document.createElement("div");
    content.className = "accordion-content";

    program.profiles.forEach(profile => {
      const card = document.createElement("div");
      card.className = "profile-card";

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;">
          <div style="flex:1;min-width:280px;">
            <h4>${profile.name}</h4>
            <p style="margin-top:10px;">${profile.description || "Описание профиля не указано."}</p>
            <p style="margin-top:12px;color:#22d3ee;font-size:14px;">
              ${getProfileType(profile)}
            </p>
          </div>
          <div style="display:flex;align-items:center;color:#94a3b8;font-size:14px;">
            Подробнее →
          </div>
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

      document.querySelectorAll(".accordion-header").forEach(item => {
        const icon = item.querySelector("[data-accordion-icon]");
        if (icon) icon.textContent = "+";
      });

      if (!isOpen) {
        content.classList.add("open");
      }

      const currentIcon = header.querySelector("[data-accordion-icon]");
      if (currentIcon) {
        currentIcon.textContent = !isOpen ? "−" : "+";
      }
    };

    const iconNode = header.querySelector("div:last-child");
    if (iconNode) {
      iconNode.setAttribute("data-accordion-icon", "true");
    }

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
      <span class="modal-close" aria-label="Закрыть модальное окно">&times;</span>

      <div style="margin-bottom:24px;">
        <p style="color:#22d3ee;font-size:14px;font-weight:700;margin-bottom:10px;">
          ${program.code} — ${program.name}
        </p>
        <h2>${profile.name}</h2>
        <p style="margin-top:14px;">${profile.description || "Описание профиля не указано."}</p>
      </div>

      <section style="margin-top:22px;">
        <h3>Тип выпускника</h3>
        <p>${getProfileType(profile)}</p>
      </section>

      <section style="margin-top:22px;">
        <h3>Технический стек</h3>
        <ul>${buildList(profile.stack)}</ul>
      </section>

      <section style="margin-top:22px;">
        <h3>Распределение дисциплин</h3>
        <div style="margin-top:14px;background:rgba(15,23,42,0.45);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;">
          <canvas id="distributionChart"></canvas>
        </div>
      </section>

      <section style="margin-top:22px;">
        <h3>Оценка профиля</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:12px;">
          <div style="background:rgba(15,23,42,0.45);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
            <div style="color:#94a3b8;font-size:14px;">Программирование</div>
            <div style="font-size:24px;font-weight:800;margin-top:6px;">${rating.programming}/10</div>
          </div>
          <div style="background:rgba(15,23,42,0.45);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
            <div style="color:#94a3b8;font-size:14px;">Математика</div>
            <div style="font-size:24px;font-weight:800;margin-top:6px;">${rating.math}/10</div>
          </div>
          <div style="background:rgba(15,23,42,0.45);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
            <div style="color:#94a3b8;font-size:14px;">Инженерность</div>
            <div style="font-size:24px;font-weight:800;margin-top:6px;">${rating.engineering}/10</div>
          </div>
          <div style="background:rgba(15,23,42,0.45);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
            <div style="color:#94a3b8;font-size:14px;">Прикладность</div>
            <div style="font-size:24px;font-weight:800;margin-top:6px;">${rating.applied}/10</div>
          </div>
          <div style="background:rgba(15,23,42,0.45);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;">
            <div style="color:#94a3b8;font-size:14px;">Исследовательский потенциал</div>
            <div style="font-size:24px;font-weight:800;margin-top:6px;">${rating.research}/10</div>
          </div>
        </div>
      </section>

      <section style="margin-top:22px;">
        <h3>Кому подойдёт</h3>
        <ul>${buildList(profile.suitable)}</ul>
      </section>

      <section style="margin-top:22px;">
        <h3>Кому не подойдёт</h3>
        <ul>${buildList(profile.notSuitable)}</ul>
      </section>

      <section style="margin-top:22px;">
        <h3>Преимущества</h3>
        <ul>${buildList(profile.strengths)}</ul>
      </section>

      <section style="margin-top:22px;">
        <h3>Потенциальные риски</h3>
        <ul>${buildList(profile.risks)}</ul>
      </section>

      <section style="margin-top:22px;">
        <h3>Аналитический вывод</h3>
        <p>${profile.analyticConclusion || "Аналитический вывод не указан."}</p>
      </section>
    </div>
  `;

  document.body.appendChild(modal);

  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  activeModal = modal;

  const closeBtn = modal.querySelector(".modal-close");
  closeBtn.onclick = closeModal;

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

function renderChart(data) {
  const ctx = document.getElementById("distributionChart");
  if (!ctx) return;

  if (distributionChartInstance) {
    distributionChartInstance.destroy();
  }

  distributionChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(data),
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
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#f1f5f9"
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#cbd5e1",
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            color: "rgba(148, 163, 184, 0.08)"
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: "#cbd5e1",
            callback: value => `${value}%`
          },
          grid: {
            color: "rgba(148, 163, 184, 0.08)"
          }
        }
      }
    }
  });

  ctx.parentElement.style.minHeight = "360px";
}

buildProgramCards();