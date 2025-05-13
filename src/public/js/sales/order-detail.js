document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("confirmationModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalConfirmBtn = document.getElementById("modalConfirmBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const closeModalBtn = document.querySelector(".close-modal");

  // Cập nhật trạng thái vận chuyển
  const updateShippingStatusBtn = document.getElementById(
    "updateShippingStatusBtn"
  );
  if (updateShippingStatusBtn) {
    updateShippingStatusBtn.addEventListener("click", () => {
      const orderId = updateShippingStatusBtn.getAttribute("data-order-id");
      const shippingStatusSelect = document.getElementById("shipping-status");
      const shippingStatus = shippingStatusSelect.value;

      if (!shippingStatus || shippingStatus === "-- Chọn trạng thái mới --") {
        showNotification("Vui lòng chọn trạng thái vận chuyển mới", false);
        shippingStatusSelect.focus();
        return;
      }

      modalTitle.textContent = "Cập nhật trạng thái vận chuyển";
      modalMessage.textContent = `Bạn có chắc chắn muốn cập nhật trạng thái vận chuyển của đơn hàng #${orderId} thành "${shippingStatus}" không?`;

      modalConfirmBtn.onclick = () => {
        // Thêm hiệu ứng loading cho nút
        updateShippingStatusBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
        updateShippingStatusBtn.disabled = true;

        try {
          fetch(`/admin/sales/orders/${orderId}/updateShippingStatus`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: shippingStatus,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Lỗi mạng hoặc server");
              }
              return res.json();
            })
            .then((data) => {
              console.log("Cập nhật trạng thái vận chuyển thành công");
              closeModal(modal);
              showNotification(
                "Cập nhật trạng thái vận chuyển thành công",
                true
              );
              // Chờ 1 giây trước khi tải lại trang để người dùng kịp thấy thông báo
              setTimeout(() => {
                window.location.href = `/admin/sales/orders/${orderId}`;
              }, 1000);
            })
            .catch((error) => {
              console.error("Error", error);
              closeModal(modal);
              // Restore button
              updateShippingStatusBtn.innerHTML =
                '<i class="fas fa-sync-alt"></i> Cập nhật';
              updateShippingStatusBtn.disabled = false;
              showNotification("Đã xảy ra lỗi khi cập nhật trạng thái", false);
            });
        } catch (error) {
          console.error("Lỗi xử lý", error);
          showNotification("Cập nhật trạng thái vận chuyển thất bại", false);
          // Restore button
          updateShippingStatusBtn.innerHTML =
            '<i class="fas fa-sync-alt"></i> Cập nhật';
          updateShippingStatusBtn.disabled = false;
          closeModal(modal);
        }
      };

      openModal(modal);
    });
  }

  // Các nút xác nhận và hủy đơn hàng khác
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
          // Hiệu ứng loading cho nút
          button.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
          button.disabled = true;

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
                showNotification(
                  `Đơn hàng đã được ${modalTitleText.toLowerCase()} thành công`,
                  true
                );
                setTimeout(() => {
                  window.location.href = `/admin/sales/orders/${orderId}`;
                }, 1000);
                return res.json();
              })
              .catch((error) => {
                console.error("Error", error);
                closeModal(modal);
                // Restore button
                const innerHTML = button.innerHTML;
                button.innerHTML = innerHTML.replace(
                  '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...',
                  button.innerHTML
                );
                button.disabled = false;
                showNotification(
                  `Đã xảy ra lỗi khi ${modalTitleText.toLowerCase()}`,
                  false
                );
              });
          } catch (error) {
            console.error("Lỗi xử lý", error);
            closeModal(modal);
            // Restore button
            const innerHTML = button.innerHTML;
            button.innerHTML = innerHTML.replace(
              '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...',
              button.innerHTML
            );
            button.disabled = false;
          }
        };
        openModal(modal);
      });
    }
  }

  // Thiết lập cho các nút khác
  setupOrderButton(
    "confirmOrderBtn",
    "Xác nhận đơn hàng",
    "Bạn có chắc chắn muốn xác nhận đơn hàng #{orderId} không?",
    "confirmOrder",
    "Chờ lấy hàng"
  );

  setupOrderButton(
    "cancelOrderBtn",
    "Hủy đơn hàng",
    "Bạn có chắc chắn muốn hủy đơn hàng #{orderId} không?",
    "cancelOrder",
    "Đã hủy",
    "NULL"
  );

  setupOrderButton(
    "confirmReturnRequestBtn",
    "Xác nhận yêu cầu trả hàng",
    "Bạn có chắc chắn muốn xác nhận yêu cầu trả hàng cho đơn hàng #{orderId} không?",
    "confirmReturnRequest",
    "Trả hàng",
    "NULL"
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

  function showNotification(message, isSuccess = true) {
    const notification = document.createElement("div");
    notification.className = `notification ${isSuccess ? "success" : "error"}`;
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas ${
          isSuccess ? "fa-check-circle" : "fa-exclamation-circle"
        }"></i>
      </div>
      <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notification);

    // Hiệu ứng hiển thị
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});
