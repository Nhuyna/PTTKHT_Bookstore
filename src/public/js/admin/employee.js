// Gán sự kiện tự động cho các cột có class "sortable"
window.addEventListener("DOMContentLoaded", () => {
    const headers = document.querySelectorAll("#header-row td");
    headers.forEach((td, index) => {
        if (td.classList.contains("sortable")) {
            td.style.cursor = "pointer";
            td.addEventListener("click", () => sortTable(index));
        }
    });

    // Thông báo xóa danh mục
    const deleteBtns = document.querySelectorAll('.delete-btn');
    const deletePopup = document.querySelector('.delete-popup');
    const closeBtn = document.querySelector('.popup-close-btn');
    const cancelBtn = document.querySelector('.popup-cancel-btn');
    const confirmBtn = document.querySelector('.popup-confirm-btn');

    let selectedProductId = null;

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedProductId = btn.getAttribute('data-id');
            deletePopup.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', () => {
        deletePopup.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        deletePopup.classList.remove('active');
    });

    confirmBtn.addEventListener('click', () => {
        if (selectedProductId) {
            // Điều hướng tới URL xóa
            window.location.href = `/admin/employee/delete/${selectedProductId}`;
        }
    });
});

// Sắp xếp
let sortDirections = {}; // lưu trạng thái sort từng cột

function sortTable(colIndex) {
    const table = document.getElementById("employee_table");
    const rows = Array.from(table.tBodies[0].rows);
  
    const isAscending = !sortDirections[colIndex];
    sortDirections[colIndex] = isAscending;
  
    rows.sort((a, b) => {
        const cellA = a.cells[colIndex];
        const cellB = b.cells[colIndex];
      
        const valA = cellA.dataset.value || cellA.innerText.trim();
        const valB = cellB.dataset.value || cellB.innerText.trim();
      
        const isNumber = !isNaN(valA) && !isNaN(valB);
        return isNumber
          ? (isAscending ? valA - valB : valB - valA)
          : (isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA));
    });
  
    const tbody = table.tBodies[0];
    rows.forEach(row => tbody.appendChild(row));
  
    // Reset mũi tên tất cả
    const allArrows = document.querySelectorAll("#header-row .arrow");
    allArrows.forEach(arrow => arrow.textContent = "▲");
  
    // Đặt lại mũi tên cho cột đang sort
    const currentArrow = table.rows[0].cells[colIndex].querySelector(".arrow");
    if (currentArrow) currentArrow.textContent = isAscending ? "▲" : "▼";
}