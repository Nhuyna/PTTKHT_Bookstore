// Dashboard JavaScript for Bookstore Management

document.addEventListener("DOMContentLoaded", function () {
  // Initialize charts
  initRevenueChart();
  initCategoryChart();
});

// Initialize the revenue chart
export function initRevenueChart() {
  // Load revenue data from hidden element
  const revenueDataElement = document.getElementById("revenue-data");
  const revenueData = JSON.parse(revenueDataElement.textContent || "[]");

  // Format dates and prepare datasets
  const labels = revenueData.map((item) => {
    const date = new Date(item.Ngay);
    return date.getDate() + "/" + (date.getMonth() + 1);
  });

  const revenues = revenueData.map((item) => item.DoanhThu || 0);
  const costs = revenueData.map((item) => item.Von || 0);
  const profit = revenueData.map((item) => item.LoiNhuan || 0);

  if (revenueChart) {
    revenueChart.destroy();
  }
  // Configure and create the revenue chart
  revenueChart = new Chart(
    document.getElementById("revenue-chart").getContext("2d"),
    {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Doanh thu",
            data: revenues,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Vốn",
            data: costs,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Lợi nhuận",
            data: profit,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              // Format large numbers with comma separators
              callback: function (value) {
                return new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(value);
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                label += new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(context.raw);
                return label;
              },
            },
          },
        },
      },
    }
  );
}

// Initialize the category chart
function initCategoryChart() {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  // Load category data from hidden element
  const categoryDataElement = document.getElementById("category-data");
  let categoryItems = [];

  try {
    categoryItems = JSON.parse(categoryDataElement.textContent || "[]");
    console.log("Category items:", categoryItems);
  } catch (error) {
    console.error("Error parsing category data:", error);
    categoryItems = [];
  }
  // Prepare category data
  const categoryData = {
    labels: categoryItems.map((item) => item.TenDanhMuc),
    datasets: [
      {
        data: categoryItems.map((item) => item.PhanTram),
        backgroundColor: [
          "rgba(78, 115, 223, 0.8)",
          "rgba(28, 200, 138, 0.8)",
          "rgba(246, 194, 62, 0.8)",
          "rgba(231, 74, 59, 0.8)",
          "rgba(90, 92, 105, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(199, 199, 199, 0.8)",
          "rgba(83, 102, 255, 0.8)",
          "rgba(233, 30, 99, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart configuration
  categoryChart = new Chart(
    document.getElementById("categoryChart").getContext("2d"),
    {
      type: "doughnut",
      data: categoryData,
      options: {
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const categoryName = context.label || "";
                const percentage = context.parsed || context.raw || 0;
                return `${categoryName}: ${percentage.toFixed(2)}%`;
              },
            },
          },
        },
      },
    }
  );
}

// Global chart variables
let categoryChart;
let revenueChart;
