const ctx = document.getElementById("salaryChart");

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ["ML-инженер","Backend","ИБ специалист"],
    datasets: [
      {
        label: "Junior",
        data: [140, 120, 110]
      },
      {
        label: "Middle",
        data: [250, 220, 200]
      },
      {
        label: "Senior",
        data: [450, 400, 350]
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#f1f5f9" } }
    },
    scales: {
      x: { ticks: { color: "#f1f5f9" } },
      y: { ticks: { color: "#f1f5f9" } }
    }
  }
});
