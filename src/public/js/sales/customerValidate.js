document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("createCustomerForm");
  console.log("hihi");

  if (form) {
    form.addEventListener("submit", function (event) {
      let hasError = false;

      // Reset tất cả thông báo lỗi trước đó
      document.querySelectorAll(".field-error").forEach((error) => {
        error.style.display = "none";
      });

      document.querySelectorAll("input").forEach((input) => {
        input.classList.remove("input-error");
      });

      // Kiểm tra tên khách hàng
      const tenKH = document.getElementById("TenKH");
      if (!tenKH.value.trim()) {
        document.getElementById("TenKH-error").textContent =
          "Tên khách hàng không được để trống";
        document.getElementById("TenKH-error").style.display = "block";
        tenKH.classList.add("input-error");
        hasError = true;
      }

      // Kiểm tra tên tài khoản và mật khẩu
      const tenTK = document.getElementById("TenTK");
      const matKhau = document.getElementById("MatKhau");

      if (matKhau.value.trim() && matKhau.value.length < 6) {
        console.log("pass:", matKhau.value);
        document.getElementById("MatKhau-error").textContent =
          "Mật khẩu cần có ít nhất 6 ký tự";
        document.getElementById("MatKhau-error").style.display = "block";
        matKhau.classList.add("input-error");
        hasError = true;
      }

      // Kiểm tra số điện thoại
      const sdt = document.getElementById("SDT");
      if (sdt.value.trim()) {
        const phonePattern = /^0\d{9}$/; // Kiểm tra số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
        if (!phonePattern.test(sdt.value.trim())) {
          document.getElementById("SDT-error").textContent =
            "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng số 0)";
          document.getElementById("SDT-error").style.display = "block";
          sdt.classList.add("input-error");
          hasError = true;
        }
      }

      // Nếu có lỗi, ngăn form submit
      if (hasError) {
        event.preventDefault();
      }
    });
  }

  // Kiểm tra URL để xem có thông báo từ server không
  const urlParams = new URLSearchParams(window.location.search);
  const errorMsg = urlParams.get("error");
  const successMsg = urlParams.get("success");

  // Hiển thị thông báo lỗi nếu có
  if (errorMsg) {
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.textContent = decodeURIComponent(errorMsg);
      errorElement.style.display = "block";

      // Tự động ẩn sau 5 giây
      setTimeout(function () {
        errorElement.style.display = "none";
      }, 5000);
    }
  }

  // Hiển thị thông báo thành công nếu có
  if (successMsg) {
    const successElement = document.getElementById("successMessage");
    if (successElement) {
      successElement.textContent = decodeURIComponent(successMsg);
      successElement.style.display = "block";

      // Tự động ẩn sau 5 giây
      setTimeout(function () {
        successElement.style.display = "none";
      }, 5000);
    }
  }
});
