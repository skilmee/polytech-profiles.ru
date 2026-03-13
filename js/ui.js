const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const welcome = document.getElementById("welcome");
const quiz = document.getElementById("quiz");
const result = document.getElementById("result");

const questionTitle = document.getElementById("questionTitle");
const answersDiv = document.getElementById("answers");
const progressBar = document.getElementById("progress");

const resultTitle = document.getElementById("resultTitle");
const resultDetails = document.getElementById("resultDetails");

let currentQuestion = 0;

let userVector = {};
PARAMETERS.forEach(param => {
  userVector[param] = 0;
});

function showScreen(screen) {
  document.querySelectorAll(".navigator-card")
    .forEach(card => card.classList.remove("active"));

  screen.classList.add("active");
}

function loadQuestion() {
  const current = questions[currentQuestion];
  questionTitle.textContent = current.question;
  answersDiv.innerHTML = "";

  const scale = [
    { text: "Совсем не согласен", value: 0 },
    { text: "Скорее не согласен", value: 1 },
    { text: "Нейтрально", value: 2 },
    { text: "Скорее согласен", value: 3 },
    { text: "Полностью согласен", value: 4 }
  ];

  scale.forEach(option => {
    const btn = document.createElement("div");
    btn.className = "answer-btn";
    btn.textContent = option.text;

    btn.onclick = () => {
      Object.keys(current.effects).forEach(key => {
        userVector[key] += current.effects[key] * option.value;
      });

      currentQuestion++;
      progressBar.style.width = `${(currentQuestion / questions.length) * 100}%`;

      if (currentQuestion < questions.length) {
        loadQuestion();
      } else {
        showResults();
      }
    };

    answersDiv.appendChild(btn);
  });
}

function showResults() {
  const recommendation = buildRecommendation(userVector);
  const best = recommendation.best;

  showScreen(result);

  resultTitle.innerHTML = `
    <div class="result-main-title">${best.program.code} — ${best.profile.name}</div>
    <div class="result-subtitle">${best.program.name}</div>
    <div class="result-percent">Совпадение: ${best.percent}%</div>
  `;

  resultDetails.innerHTML = `
    <section class="result-section">
      <p class="result-paragraph">${best.profile.description}</p>
    </section>

    <section class="result-section">
      <h3>Почему этот профиль вам подходит</h3>
      <ul class="result-list">
        ${recommendation.matchFactors.map(item => `<li>${item.label}</li>`).join("")}
      </ul>
    </section>

    <section class="result-section">
      <h3>Какие параметры сильнее всего повлияли на результат</h3>
      <div class="factor-table">
        <div class="factor-row factor-head">
          <div>Параметр</div>
          <div>Ваш уровень</div>
          <div>Требование профиля</div>
        </div>
        ${recommendation.matchFactors.map(item => `
          <div class="factor-row">
            <div>${item.label}</div>
            <div>${item.userValue}</div>
            <div>${item.profileValue}</div>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="result-section">
      <h3>Ключевые требования профиля</h3>
      <ul class="result-list">
        ${recommendation.profileRequirements.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="result-section">
      <h3>Ваши сильные стороны</h3>
      <ul class="result-list">
        ${recommendation.userStrengths.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="result-section">
      <h3 class="danger-title">Зоны роста</h3>
      <ul class="result-list">
        ${recommendation.growthZones.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="result-section">
      <h3>Топ-3 профиля</h3>
      <ol class="result-list ordered-list">
        ${recommendation.topResults.map(item => `
          <li>${item.program.code} — ${item.profile.name} (${item.percent}%)</li>
        `).join("")}
      </ol>
    </section>

    <section class="result-section">
      <h3>Близкие альтернативы</h3>
      <div class="alternative-list">
        ${recommendation.alternatives.map(item => `
          <div class="alternative-card">
            <strong>${item.program.code} — ${item.profile.name}</strong>
            <span>${item.percent}%</span>
            <p>${item.profile.description}</p>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="result-section">
      <h3>Подходящие профессиональные роли</h3>
      <ul class="result-list">
        ${recommendation.careers.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="result-section">
      <h3>Что можно начать изучать уже сейчас</h3>
      <ul class="result-list">
        ${recommendation.firstSteps.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </section>
  `;

  requestAnimationFrame(() => {
    renderChart(best.profile.vector);
  });
}

function splitRadarLabel(label, maxLength = 16) {
  const words = label.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines;
}

function renderChart(profileVector) {
  const ctx = document.getElementById("skillsChart");
  if (!ctx) return;

  if (window.myChart) {
    window.myChart.destroy();
  }

  const isMobile = window.innerWidth < 768;

  const labels = PARAMETERS.map(param => {
    const label = translateParam(param);
    return isMobile ? splitRadarLabel(label, 16) : label;
  });

  const maxValue = Math.max(
    8,
    ...PARAMETERS.map(param => userVector[param] || 0),
    ...PARAMETERS.map(param => profileVector[param] || 0)
  );

  window.myChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Ваш профиль",
          data: PARAMETERS.map(param => userVector[param] || 0),
          backgroundColor: "rgba(99, 102, 241, 0.25)",
          borderColor: "#6366f1",
          borderWidth: 2,
          pointBackgroundColor: "#6366f1",
          pointRadius: 3
        },
        {
          label: "Требования профиля",
          data: PARAMETERS.map(param => profileVector[param] || 0),
          backgroundColor: "rgba(34, 211, 238, 0.2)",
          borderColor: "#22d3ee",
          borderWidth: 2,
          pointBackgroundColor: "#22d3ee",
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: {
        padding: {
          top: 26,
          right: isMobile ? 18 : 8,
          bottom: 8,
          left: isMobile ? 18 : 8
        }
      },
      scales: {
        r: {
          min: 0,
          max: maxValue,
          grid: { color: "#334155" },
          angleLines: { color: "#334155" },
          pointLabels: {
            color: "#f1f5f9",
            centerPointLabels: true,
            padding: isMobile ? 8 : 6,
            font: {
              size: isMobile ? 10 : 13
            }
          },
          ticks: {
            display: false,
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#f1f5f9",
            padding: 24,
            font: {
              size: isMobile ? 11 : 14
            }
          }
        }
      }
    }
  });
}

startBtn.onclick = () => {
  showScreen(quiz);
  loadQuestion();
};

restartBtn.onclick = () => {
  location.reload();
};
