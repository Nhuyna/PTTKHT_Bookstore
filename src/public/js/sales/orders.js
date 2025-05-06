document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("confirmationModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const closeModalBtn = document.querySelector(".close-modal");

  function setupOrderButton(
    buttonId,
    modalTitleText,
    modalMessageTemplate,
    endpoint,
    statusValue,
    requestValue
  ) {
    if (
      !modal ||
      !modalTitle ||
      !modalMessage ||
      !modalConfirmBtn ||
      !modalCancelBtn ||
      !closeModalBtn
    ) {
      console.error("Confirmation modal elements not found!");
      return;
    }
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => {
        const orderId = button.getAttribute("data-order-id");

        modalTitle.textContent = modalTitleText;
        modalMessage.textContent = modalMessageTemplate.replace(
          "{orderId}",
          orderId
        );

        modalConfirmBtn.onclick = () => {
          try {
            fetch(`/admin/sales/orders/${orderId}/${endpoint}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: statusValue,
                request: requestValue,
              }),
            })
              .then((res) => {
                if (!res.ok) {
                  throw new Error("Lỗi mạng hoặc server");
                }
                console.log(`Đơn hàng đã ${endpoint} thành công`);
                closeModal(modal);
                window.location.href = `/admin/sales/orders/${orderId}`;
                return res.json();
              })
              .catch((error) => {
                console.error("Error", error);
                closeModal(modal);
              });
          } catch (error) {
            console.error("Lỗi xử lý", error);
            closeModal(modal);
          }
        };
        openModal(modal);
      });
    }
  }

  setupOrderButton(
    "confirmOrderBtn",
    "Xác nhận đơn hàng",
    "Bạn có chắc chắn muốn xác nhận đơn hàng #{orderId} không?",
    "confirm",
    "Chờ lấy hàng"
  );

  setupOrderButton(
    "cancelOrderBtn",
    "Hủy đơn hàng",
    "Bạn có chắc chắn muốn hủy đơn hàng #{orderId} không?",
    "cancel",
    "Đã hủy",
    "0"
  );

  setupOrderButton(
    "confirmReturnRequestBtn",
    "Xác nhận yêu cầu trả hàng",
    "Bạn có chắc chắn muốn xác nhận yêu cầu trả hàng cho đơn hàng #{orderId} không?",
    "confirmReturnRequest",
    "Trả hàng",
    "0"
  );

  setupOrderButton(
    "archiveOrderBtn",
    "Lưu trữ đơn hàng",
    "Bạn có chắc chắn muốn lưu trữ đơn hàng #{orderId} không?",
    "archive",
    1
  );

  setupOrderButton(
    "unarchiveOrderBtn",
    "Bỏ lưu trữ đơn hàng",
    "Bạn có chắc chắn muốn bỏ lưu trữ đơn hàng #{orderId} không?",
    "unarchive",
    "0"
  );

  setupOrderButton(
    "confirmPaymentBtn",
    "Xác nhận thanh toán",
    "Bạn có chắc chắn muốn xác nhận thanh toán cho đơn hàng #{orderId} không?",
    "confirmPayment",
    "Đã thanh toán"
  );

  setupOrderButton(
    "confirmRefundBtn",
    "Xác nhận hoàn trả",
    "Bạn có chắc chắn muốn xác nhận hoàn trả cho đơn hàng #{orderId} không?",
    "confirmRefund",
    "Đã hoàn tiền"
  );

  modalCancelBtn?.addEventListener("click", () => closeModal(modal));
  closeModalBtn?.addEventListener("click", () => closeModal(modal));

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  function openModal(modal) {
    modal.style.display = "flex";
  }

  function closeModal(modal) {
    modal.style.display = "none";
  }
});
