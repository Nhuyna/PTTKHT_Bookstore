document.addEventListener("DOMContentLoaded", function () {
  // Lưu tab hiện tại để biết loại thống kê nào đang được hiển thị
  let currentTab = "day"; // Mặc định là thống kê theo ngày
  const dateRangeSelector = document.getElementById("date-range-selector");
  const yearSelector = document.getElementById("year-selector");
  const monthInYearSelector = document.getElementById("month-in-year-selector");
  const dayInMonthSelector = document.getElementById("day-in-month-selector");
  const selectYearForMonths = /**@type {HTMLInputElement}*/ (
    document.getElementById("select-year-for-months")
  );
  const endDateElement = /**@type {HTMLInputElement}*/ (
    document.getElementById("end-date")
  );
  const startDateElement = /**@type {HTMLInputElement}*/ (
    document.getElementById("start-date")
  );
  const selectedYear = /**@type {HTMLInputElement}*/ (
    document.getElementById("select-year")
  );

  if (
    !dateRangeSelector ||
    !yearSelector ||
    !monthInYearSelector ||
    !dayInMonthSelector
  ) {
    console.error("One or more selectors are missing in the DOM.");
    return;
  }

  // Handle tab switching
  document.querySelectorAll(".tab-item").forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      document
        .querySelectorAll(".tab-item")
        .forEach((t) => t.classList.remove("active"));

      // Add active class to current tab
      tab.classList.add("active");

      // Get selected tab value
      let currentTab = tab.getAttribute("data-tab");
      console.log("Tab changed to:", currentTab);

      // Hide all selectors first

      dateRangeSelector.style.display = "none";
      yearSelector.style.display = "none";
      monthInYearSelector.style.display = "none";
      dayInMonthSelector.style.display = "none";

      // Show appropriate selector based on tab
      if (currentTab === "custom") {
        dateRangeSelector.style.display = "block";
        // Tự động tải dữ liệu với khoảng thời gian đã chọn
        const startDate = startDateElement.value;
        const endDate = endDateElement.value;
        if (startDate && endDate) {
          fetchRevenueByDateRange(startDate, endDate);
        }
      } else if (currentTab === "year") {
        yearSelector.style.display = "block";
        // Tự động tải dữ liệu theo năm đã chọn
        const startYear = /**@type {HTMLInputElement}*/ (
          document.getElementById("select-year")
        ).value;
        const endYear = selectYearForMonths.value;
        if (startYear && endYear) {
          fetchRevenueByYear(startYear, endYear);
        }
      } else if (currentTab === "month") {
        monthInYearSelector.style.display = "block";
        // Tự động tải dữ liệu theo tháng trong năm đã chọn
        const year = selectYearForMonths.value;
        if (year) {
          fetchRevenueByMonth(year);
        }
      } else if (currentTab === "day") {
        dayInMonthSelector.style.display = "block";
        // Tự động tải dữ liệu theo ngày trong tháng đã chọn
        loadDailyData();
      }
    });
  });

  // Khởi tạo với selector ngày trong tháng hiển thị mặc định
  dayInMonthSelector.style.display = "block";

  // Chuẩn bị dữ liệu năm cho selectors
  const currentYear = new Date().getFullYear();
  const selectYearElements = document.querySelectorAll(
    "#select-year, #select-year-for-months"
  );

  selectYearElements.forEach((select) => {
    // Xóa các option hiện tại
    select.innerHTML = "";

    // Thêm options cho 5 năm gần đây
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      const option = document.createElement("option");
      option.value = year.toString();
      option.textContent = year.toString();
      select.appendChild(option);
    }
  });

  // Chuẩn bị dữ liệu tháng cho select-month
  const selectMonth = /**@type {HTMLSelectElement}*/ (
    document.getElementById("select-month")
  );
  const currentMonth = new Date().getMonth() + 1; // getMonth() trả về 0-11

  if (!selectMonth) {
    console.error("Select month element is missing in the DOM.");
    return;
  }
  // Xóa các option hiện tại
  selectMonth.innerHTML = "";

  // Thêm options cho các tháng trong năm
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = `Tháng ${i}/${currentYear}`;
    selectMonth.appendChild(option);
  }

  // Thiết lập giá trị mặc định cho tháng hiện tại
  selectMonth.value = currentMonth.toString();

  // Thiết lập ngày hiện tại cho date pickers
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  startDateElement.value = formatDateForInput(oneMonthAgo);
  endDateElement.value = formatDateForInput(today);

  // Handler cho apply-date-range
  document.getElementById("apply-date-range")?.addEventListener("click", () => {
    const startDate = startDateElement.value;
    const endDate = endDateElement.value;
    console.log("Applied date range:", startDate, "to", endDate);

    // Hiển thị thông báo đang tải dữ liệu
    showLoadingMessage();

    // Gọi API để lấy dữ liệu theo khoảng thời gian
    fetchRevenueByDateRange(startDate, endDate);
  });

  // Handler cho apply-year
  document.getElementById("apply-year")?.addEventListener("click", () => {
    const startYear = selectedYear.value;
    const endYear = selectYearForMonths.value;
    console.log("Applied year range:", startYear, "to", endYear);

    // Hiển thị thông báo đang tải dữ liệu
    showLoadingMessage();

    // Gọi API để lấy dữ liệu theo năm
    fetchRevenueByYear(startYear, endYear);
  });

  // Handler cho apply-month-in-year
  document
    .getElementById("apply-month-in-year")
    ?.addEventListener("click", () => {
      const year = selectYearForMonths.value;
      console.log("Applied year for monthly stats:", year);

      // Hiển thị thông báo đang tải dữ liệu
      showLoadingMessage();

      // Gọi API để lấy dữ liệu theo tháng trong năm
      fetchRevenueByMonth(year);
    });

  // Handler cho apply-day-in-month
  document
    .getElementById("apply-day-in-month")
    ?.addEventListener("click", function () {
      loadDailyData();
    });

  function loadDailyData() {
    const month = selectMonth.value;
    const year = currentYear; // Sử dụng năm hiện tại
    console.log("Applied month:", month, "year:", year);

    // Hiển thị thông báo đang tải dữ liệu
    showLoadingMessage();

    // Gọi API để lấy dữ liệu theo ngày trong tháng
    fetchRevenueByDay(month, year);
  }

  // Handler cho xuất Excel
  document.getElementById("export-btn")?.addEventListener("click", () => {
    // Xác định tab đang active
    let params = {};

    if (currentTab === "custom") {
      params = {
        type: "custom",
        startDate: startDateElement.value,
        endDate: endDateElement.value,
      };
    } else if (currentTab === "year") {
      params = {
        type: "year",
        startYear: selectedYear.value,
        endYear: selectYearForMonths.value,
      };
    } else if (currentTab === "month") {
      params = {
        type: "month",
        year: selectYearForMonths.value,
      };
    } else if (currentTab === "day") {
      params = {
        type: "day",
        month: selectMonth.value,
        year: currentYear,
      };
    }

    // Tạo URL với query params
    // @ts-ignore
    const queryString = new URLSearchParams(params).toString();
    const exportUrl = `/admin/sales/statistic/api/export?${queryString}`;
    // Gửi yêu cầu tải xuống
    fetch(exportUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Mở cửa sổ tải xuống
          window.open(data.filePath, "_blank");
        } else {
          showError("Đã xảy ra lỗi khi xuất file: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Export error:", error);
        showError("Đã xảy ra lỗi khi xuất file");
      });
  });

  // Hàm hiển thị thông báo đang tải
  function showLoadingMessage() {
    const tableBody = document.querySelector(".statistics-table tbody");
    if (!tableBody) {
      console.error("Table body element is missing in the DOM.");
      return;
    }
    tableBody.innerHTML =
      '<tr><td colspan="4" class="loading-message">Đang tải dữ liệu...</td></tr>';
  }

  // Hàm hiển thị thông báo lỗi
  function showError(message) {
    alert(message);
  }

  // Hàm cập nhật bảng hiển thị
  function updateTable(data, totals) {
    const tableBody = document.querySelector(".statistics-table tbody");
    const tableFoot = document.querySelector(".statistics-table tfoot");
    if (!tableBody || !tableFoot) {
      console.error("Table body element is missing in the DOM.");
      return;
    }
    // Xóa dữ liệu cũ
    tableBody.innerHTML = "";

    if (data.length === 0) {
      // Nếu không có dữ liệu, hiển thị thông báo
      tableBody.innerHTML =
        '<tr><td colspan="4" class="no-data">Không có dữ liệu cho khoảng thời gian này</td></tr>';
    } else {
      // Thêm dữ liệu mới
      data.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.Ngay}</td>
          <td>${item.DoanhThu}</td>
          <td>${item.Von}</td>
          <td>${item.LoiNhuan}</td>
        `;
        tableBody.appendChild(row);
      });
    }

    // Cập nhật footer với tổng
    tableFoot.innerHTML = `
      <tr>
        <td>Tổng</td>
        <td>${totals.DoanhThu}</td>
        <td>${totals.Von}</td>
        <td>${totals.LoiNhuan}</td>
      </tr>
    `;
  }

  // API functions
  function fetchRevenueByDateRange(startDate, endDate) {
    fetch(
      `/admin/sales/statistic/api/date-range?startDate=${startDate}&endDate=${endDate}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateTable(data.data, data.totals);
        } else {
          showError("Lỗi: " + data.message);
        }
      })
      .catch((error) => {
        console.error("API error:", error);
        showError("Đã xảy ra lỗi khi lấy dữ liệu");
      });
  }

  function fetchRevenueByMonth(year) {
    fetch(`/admin/sales/statistic/api/monthly?year=${year}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateTable(data.data, data.totals);
        } else {
          showError("Lỗi: " + data.message);
        }
      })
      .catch((error) => {
        console.error("API error:", error);
        showError("Đã xảy ra lỗi khi lấy dữ liệu");
      });
  }

  function fetchRevenueByYear(startYear, endYear) {
    fetch(
      `/admin/sales/statistic/api/yearly?startYear=${startYear}&endYear=${endYear}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateTable(data.data, data.totals);
        } else {
          showError("Lỗi: " + data.message);
        }
      })
      .catch((error) => {
        console.error("API error:", error);
        showError("Đã xảy ra lỗi khi lấy dữ liệu");
      });
  }

  function fetchRevenueByDay(month, year) {
    fetch(`/admin/sales/statistic/api/daily?month=${month}&year=${year}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateTable(data.data, data.totals);
        } else {
          showError("Lỗi: " + data.message);
        }
      })
      .catch((error) => {
        console.error("API error:", error);
        showError("Đã xảy ra lỗi khi lấy dữ liệu");
      });
  }

  // Thêm styles cho thông báo
  const style = document.createElement("style");
  style.innerHTML = `
    .loading-message, .no-data {
      text-align: center;
      padding: 20px;
      font-style: italic;
      color: #666;
    }
    .no-data {
      color: #999;
    }
  `;
  document.head.appendChild(style);

  // Load dữ liệu mặc định khi trang được tải (thống kê theo ngày trong tháng hiện tại)
  loadDailyData();
});
