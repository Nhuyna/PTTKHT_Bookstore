document.addEventListener("DOMContentLoaded", function () {
  // Lấy reference đến form và các trường dữ liệu
  const createForm = document.getElementById("createCustomerForm");
  const tenKHInput = document.getElementById("TenKH");
  const tenTKInput = document.getElementById("TenTK");
  const matKhauInput = document.getElementById("MatKhau");
  const sdtInput = document.getElementById("SDT");

  // Modal elements
  const confirmSaveModal = document.getElementById("confirmSaveModal");
  const confirmSaveBtn = document.getElementById("confirmSaveBtn");
  const closeModalBtns = document.querySelectorAll("[data-dismiss='modal']");

  // Hàm hiển thị thông báo lỗi
  // function showError(message, fieldId = null) {
  //   // Xóa tất cả thông báo lỗi hiện tại
  //   clearErrors();

  //   if (fieldId) {
  //     // Hiển thị lỗi dưới trường cụ thể
  //     const errorElement = document.getElementById(fieldId + "-error");
  //     if (errorElement) {
  //       errorElement.textContent = message;
  //       errorElement.style.display = "block";

  //       // Thêm class lỗi cho trường input
  //       const inputElement = document.getElementById(fieldId);
  //       if (inputElement) {
  //         inputElement.classList.add("input-error");
  //         inputElement.focus();
  //       }
  //     }
  //   } else {
  //     // Hiển thị lỗi chung
  //     const errorMessage = document.getElementById("errorMessage");
  //     if (errorMessage) {
  //       errorMessage.textContent = message;
  //       errorMessage.style.display = "block";

  //       // Tự động cuộn lên đầu form để hiển thị lỗi
  //       errorMessage.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }
  //   }
  // }

  // Hàm hiển thị thông báo thành công
  function showSuccess(message) {
    // Tạo alert thành công
    const successAlert = document.createElement("div");
    successAlert.className = "alert alert-success";
    successAlert.textContent = message;
    successAlert.style.marginBottom = "20px";
    successAlert.style.padding = "12px 16px";
    successAlert.style.backgroundColor = "#f0fff4";
    successAlert.style.borderLeft = "4px solid #48bb78";
    successAlert.style.color = "#2f855a";
    successAlert.style.borderRadius = "4px";

    // Thêm alert vào đầu form container
    const formContainer = document.querySelector(".customer-form-container");
    if (formContainer) {
      formContainer.insertBefore(successAlert, formContainer.firstChild);

      // Cuộn lên để hiển thị thông báo
      successAlert.scrollIntoView({ behavior: "smooth", block: "start" });

      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => {
        successAlert.style.opacity = "0";
        successAlert.style.transition = "opacity 0.5s";
        setTimeout(() => {
          if (successAlert.parentNode) {
            successAlert.parentNode.removeChild(successAlert);
          }
        }, 500);
      }, 5000);
    }
  }

  // Hàm xóa tất cả thông báo lỗi
  // function clearErrors() {
  //   // Xóa thông báo lỗi chung
  //   const errorMessage = document.getElementById("errorMessage");
  //   if (errorMessage) {
  //     errorMessage.textContent = "";
  //     errorMessage.style.display = "none";
  //   }

  //   // Xóa tất cả thông báo lỗi trường
  //   const fieldErrors = document.querySelectorAll(".field-error");
  //   fieldErrors.forEach((element) => {
  //     element.textContent = "";
  //     element.style.display = "none";
  //   });

  //   // Xóa class lỗi từ tất cả trường input
  //   const inputElements = document.querySelectorAll("input, select");
  //   inputElements.forEach((element) => {
  //     element.classList.remove("input-error");
  //   });
  // }

  // Hàm kiểm tra form
  function validateForm() {
    // Xóa tất cả lỗi hiện tại
    clearErrors();

    // Kiểm tra tên khách hàng (bắt buộc)
    if (!tenKHInput || !tenKHInput.value.trim()) {
      showError("Vui lòng nhập tên khách hàng", "TenKH");
      return false;
    }

    // Kiểm tra nếu có tên tài khoản thì phải có mật khẩu
    if (tenTKInput && tenTKInput.value.trim()) {
      // Kiểm tra có mật khẩu không
      if (!matKhauInput || !matKhauInput.value) {
        showError("Vui lòng nhập mật khẩu cho tài khoản", "MatKhau");
        return false;
      }

      // Kiểm tra độ dài mật khẩu
      if (matKhauInput.value.length < 6) {
        showError("Mật khẩu cần có ít nhất 6 ký tự", "MatKhau");
        return false;
      }
    }

    // Kiểm tra định dạng số điện thoại
    if (sdtInput && sdtInput.value.trim()) {
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(sdtInput.value.trim())) {
        showError(
          "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.",
          "SDT"
        );
        return false;
      }
    }

    return true;
  }

  // Hàm hiển thị modal
  // function showModal() {
  //   if (confirmSaveModal) {
  //     confirmSaveModal.style.display = "block";
  //     confirmSaveModal.classList.add("show");
  //     confirmSaveModal.setAttribute("aria-hidden", "false");
  //     document.body.classList.add("modal-open");

  //     // Thêm backdrop nếu chưa có
  //     if (!document.querySelector(".modal-backdrop")) {
  //       const backdrop = document.createElement("div");
  //       backdrop.className = "modal-backdrop fade show";
  //       document.body.appendChild(backdrop);
  //     }
  //   }
  // }

  // Hàm ẩn modal
  // function hideModal() {
  //   if (confirmSaveModal) {
  //     confirmSaveModal.style.display = "none";
  //     confirmSaveModal.classList.remove("show");
  //     confirmSaveModal.setAttribute("aria-hidden", "true");
  //     document.body.classList.remove("modal-open");

  //     // Xóa backdrop
  //     const backdrop = document.querySelector(".modal-backdrop");
  //     if (backdrop) {
  //       backdrop.parentNode.removeChild(backdrop);
  //     }
  //   }

  //   // Reset trạng thái nút
  //   if (confirmSaveBtn) {
  //     confirmSaveBtn.textContent = "Tạo khách hàng";
  //     confirmSaveBtn.disabled = false;
  //   }
  // }

  // Đăng ký sự kiện cho các nút đóng modal
  // if (closeModalBtns && closeModalBtns.length > 0) {
  //   closeModalBtns.forEach((btn) => {
  //     btn.addEventListener("click", hideModal);
  //   });
  // }

  // Đóng modal khi nhấn ra ngoài
  // window.addEventListener("click", function (event) {
  //   if (event.target === confirmSaveModal) {
  //     hideModal();
  //   }
  // });

  // Đăng ký sự kiện cho các trường input khi focus
  const formInputs = document.querySelectorAll(
    "#createCustomerForm input, #createCustomerForm select"
  );
  if (formInputs && formInputs.length > 0) {
    formInputs.forEach((input) => {
      input.addEventListener("focus", function () {
        // Xóa lỗi của trường khi người dùng bắt đầu nhập lại
        const errorElement = document.getElementById(this.id + "-error");
        if (errorElement) {
          errorElement.textContent = "";
          errorElement.style.display = "none";
        }
        this.classList.remove("input-error");
      });
    });
  }

  // Hàm gửi form bằng AJAX
  function submitFormWithAjax() {
    // Tạo formData object từ form
    const formData = new FormData(createForm);

    // Trim dữ liệu input trước khi gửi
    for (let [key, value] of formData.entries()) {
      if (typeof value === "string") {
        formData.set(key, value.trim());
      }
    }

    // Hiển thị trạng thái loading trên nút
    confirmSaveBtn.textContent = "Đang xử lý...";
    confirmSaveBtn.disabled = true;

    // Gửi request Ajax
    fetch("/admin/sales/khachhang/store", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại."
          );
        }
        return response.json();
      })
      .then((data) => {
        // Ẩn modal
        hideModal();

        if (data.success) {
          // Hiển thị thông báo thành công
          showSuccess(data.message || "Đã tạo khách hàng mới thành công!");

          // Reset form sau khi tạo thành công
          createForm.reset();

          // Thêm nút để chuyển đến trang chi tiết khách hàng
          if (data.customerId) {
            const viewButton = document.createElement("a");
            viewButton.href = `/admin/sales/khachhang/detail/${data.customerId}`;
            viewButton.className = "btn-view btn-primary";
            viewButton.textContent = "Xem khách hàng";
            viewButton.style.marginRight = "10px";
            viewButton.style.padding = "8px 16px";
            viewButton.style.backgroundColor = "#4299e1";
            viewButton.style.color = "white";
            viewButton.style.borderRadius = "4px";
            viewButton.style.textDecoration = "none";
            viewButton.style.display = "inline-block";

            // Thêm nút vào form actions
            const formActions = document.querySelector(".form-actions");
            if (formActions) {
              formActions.insertBefore(viewButton, formActions.firstChild);
            }
          }
        } else {
          // Hiển thị lỗi nếu server trả về lỗi
          showError(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
      })
      .catch((error) => {
        // Ẩn modal
        hideModal();

        // Hiển thị lỗi
        showError(
          error.message ||
            "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại."
        );

        // Reset trạng thái nút
        confirmSaveBtn.textContent = "Tạo khách hàng";
        confirmSaveBtn.disabled = false;
      });
  }

  // Xử lý sự kiện submit form
  if (createForm) {
    createForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Kiểm tra form trước khi hiển thị modal xác nhận
      if (!validateForm()) {
        return;
      }

      // Hiển thị modal xác nhận
      showModal();

      // Xử lý khi nhấn nút xác nhận trong modal
      if (confirmSaveBtn) {
        confirmSaveBtn.onclick = function () {
          // Sử dụng AJAX để gửi form
          submitFormWithAjax();
        };
      }
    });
  }

  // Thêm xử lý cho nút "Tạo khách hàng" bên ngoài form
  const saveButton = document.querySelector(".btn-save");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      // Trigger submit event của form
      if (createForm) {
        const submitEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        });
        createForm.dispatchEvent(submitEvent);
      }
    });
  }
});
