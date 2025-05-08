document.addEventListener("DOMContentLoaded", function () {
  // Xử lý chọn tất cả các checkbox
  const selectAllCheckbox = document.querySelector(".select-all-checkbox");
  const rowCheckboxes = document.querySelectorAll(".row-checkbox");

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;
      });
    });
  }

  // Kiểm tra xem đã chọn hết checkbox chưa
  rowCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const allChecked = Array.from(rowCheckboxes).every((cb) => cb.checked);
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
      }
    });
  });

  // Xử lý form tìm kiếm
  const filterForm = document.querySelector(".filter-form");
  if (filterForm) {
    filterForm.addEventListener("submit", function (e) {
      e.prevxentDefault();
      const formData = new FormData(filterForm);
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        if (value) {
          if (typeof value === "string") {
            params.set(key, value);
          }
        }
      }
      const url = `${window.location.pathname}?${params.toString()}`;

      window.location.href = url;
    });
  }

  // Nút làm mới
  const resetButton = document.querySelector(".reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      window.location.href = "/admin/sales/khachhang";
    });
  }

  // Nút xuất Excel
  const exportButton = document.querySelector(".export-button");
  if (exportButton) {
    exportButton.addEventListener("click", function () {
      const formData = new FormData(filterForm);
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        if (value) {
          if (typeof value === "string") {
            params.set(key, value);
          }
        }
      }
      const url = `${window.location.pathname}?${params.toString()}`;
      window.location.href = `/admin/sales/khachhang/export?${params.toString()}`;
    });
  }

  const deleteButton = document.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      const customerID = deleteButton.dataset.id;
      const customerName = deleteButton.dataset.name;
      const modal = document.getElementById("deleteModal");
      const modalContent = document.querySelector(".modal-content");
      modalContent.innerHTML = `
        <div class="modal-header">
          <h5 class="modal-title" id="deleteModalLabel">Xác nhận xóa</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          Bạn có chắc chắn muốn xóa khách hàng <span id="customerName">${customerName}</span>?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Hủy</button>
          <form id="deleteForm" action="/admin/sales/khachhang/delete/${customerID}" method="POST">
            <input type="hidden" name="customerId" id="customerId" value="${customerID}">
            <button type="submit" class="btn btn-danger">Xóa</button>
          </form>
        </div>`;

      modal.style.display = "block";

      const closeButtons = document.querySelectorAll("[data-dismiss='modal']");
      closeButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const modal = document.getElementById("deleteModal");
          modal.style.display = "none";
        });
      });

      // Đóng modal khi click bên ngoài modal
      window.addEventListener("click", function (event) {
        const modal = document.getElementById("deleteModal");
        if (event.target === modal) {
          modal.style.display = "none";
        }
      });
    });
  }
});
