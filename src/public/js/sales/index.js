// Menu Bar

// Checkbox
document.addEventListener("DOMContentLoaded", () => {
  const setupSelectAllCheckbox = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const selectAllCheckbox = /**@type{HTMLInputElement} */ (
      container.querySelector("thead .checkbox-custom")
    );
    const checkboxes = /**@type{NodeListOf<HTMLInputElement>} */ (
      container.querySelectorAll("tbody .checkbox-custom")
    );

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = selectAllCheckbox.checked;
        });
      });

      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const allChecked = Array.from(checkboxes).every((c) => c.checked);
          const someChecked = Array.from(checkboxes).some((c) => c.checked);

          selectAllCheckbox.checked = allChecked;
          selectAllCheckbox.indeterminate = someChecked && !allChecked;
        });
      });
    }
  };

  setupSelectAllCheckbox("all-orders");
  setupSelectAllCheckbox("return-cancel-requests");
  setupSelectAllCheckbox("archived-orders");

  const fromDateInput = /**@type {HTMLInputElement}*/ (
    document.getElementById("fromDate")
  );
  const toDateInput = /**@type {HTMLInputElement}*/ (
    document.getElementById("toDate")
  );

  const filterForm = /**@type {HTMLFormElement}*/ (
    document.querySelector(".filter-form")
  );
  const filterBtn = document.querySelector(".filter-button");

  if (fromDateInput && toDateInput && filterBtn) {
    fromDateInput.addEventListener("change", () => {
      if (
        fromDateInput.value &&
        toDateInput.value &&
        toDateInput.value < fromDateInput.value
      ) {
        toDateInput.value = fromDateInput.value;
      }
      toDateInput.min = fromDateInput.value;
    });

    if (fromDateInput.value) {
      toDateInput.min = fromDateInput.value;
    }

    // Xử lý sự kiện submit của form lọc đơn hàng
    if (filterForm) {
      filterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!fromDateInput.value && toDateInput.value) {
          alert("Vui lòng chọn ngày bắt đầu trước khi chọn ngày kết thúc.");
          return;
        }

        const formData = new FormData(filterForm);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
          if (value) {
            if (typeof value === "string") {
              params.set(key, value);
            }
          }
        }

        const currentTab = new URLSearchParams(window.location.search).get(
          "tab"
        );
        if (currentTab) {
          params.set("tab", currentTab);
        }

        const url = `${window.location.pathname}?${params.toString()}`;

        window.location.href = url;
      });
    }
  }

  // Add reset button functionality
  const resetButton = document.querySelector(".reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      // Get current tab if any
      const currentParams = new URLSearchParams(window.location.search);
      const currentTab = currentParams.get("tab");

      // Create a clean URL, preserving only the tab parameter if it exists
      let newUrl = window.location.pathname;
      if (currentTab) {
        newUrl += `?tab=${currentTab}`;
      }

      // Navigate to the clean URL
      window.location.href = newUrl;
    });
  }

  // Handle removing individual filters
  const removeFilterButtons = document.querySelectorAll(".remove-filter");
  removeFilterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const param = this.getAttribute("data-param");
      const currentParams = new URLSearchParams(window.location.search);

      // Remove the specified parameter
      currentParams.delete(param);

      // Navigate to the updated URL
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      window.location.href = newUrl;
    });
  });

  // Handle clearing all filters
  const clearAllButtons = document.querySelectorAll(".clear-all-filters");
  clearAllButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const currentParams = new URLSearchParams(window.location.search);
      const currentTab = currentParams.get("tab");

      // Create a clean URL, preserving only the tab parameter if it exists
      let newUrl = window.location.pathname;
      if (currentTab) {
        newUrl += `?tab=${currentTab}`;
      }

      // Navigate to the clean URL
      window.location.href = newUrl;
    });
  });

  // Add column sorting functionality
  const sortIcons = document.querySelectorAll(".sort-icon");
  sortIcons.forEach((sortIcon) => {
    sortIcon.addEventListener("click", function () {
      const sortField = this.getAttribute("data-sort");
      const currentParams = new URLSearchParams(window.location.search);

      // Get current sort direction
      const currentSortField = currentParams.get("sortField");
      const currentSortDir = currentParams.get("sortDir");

      // Determine the new sort direction
      let newSortDir = "asc";
      if (currentSortField === sortField && currentSortDir === "asc") {
        newSortDir = "desc";
      }

      // Update sort parameters
      currentParams.set("sortField", sortField);
      currentParams.set("sortDir", newSortDir);

      // Navigate to the URL with updated sort parameters
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      window.location.href = newUrl;
    });
  });

  // Highlight active sort column
  const initSortIcons = () => {
    const currentParams = new URLSearchParams(window.location.search);
    const currentSortField = currentParams.get("sortField");
    const currentSortDir = currentParams.get("sortDir");

    if (currentSortField) {
      const activeIcon = document.querySelector(
        `.sort-icon[data-sort="${currentSortField}"]`
      );
      if (activeIcon) {
        activeIcon.classList.add(`sort-${currentSortDir}`);
        const iconElement = activeIcon.querySelector("i");
        iconElement?.classList.remove("fa-sort");
        iconElement?.classList.add(
          currentSortDir === "asc" ? "fa-sort-up" : "fa-sort-down"
        );
      }
    }
  };

  initSortIcons();

  // Sửa lại để các tab có thể sử dụng bộ lọc
  const orderTabs = document.querySelectorAll(".order-tab");
  orderTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabValue = this.getAttribute("data-value") || "";

      const currentParams = new URLSearchParams(window.location.search);

      if (tabValue) {
        currentParams.set("tab", tabValue);
      } else {
        currentParams.delete("tab");
      }

      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;

      window.location.href = newUrl;
    });
  });

  const exportBtn = document.querySelector(".export-button");
  if (exportBtn) {
    exportBtn.addEventListener("click", (event) => {
      event.preventDefault();

      const queryParams = new URLSearchParams(window.location.search);
      window.location.href = `/admin/sales/orders/export-excel?${queryParams.toString()}`;
    });
  }
});
