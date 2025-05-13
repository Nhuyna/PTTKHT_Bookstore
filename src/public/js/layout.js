document.getElementById("openMenu").addEventListener("click", function () {
  document.getElementById("sidebar").classList.add("open");
  console.log(document.getElementById("sidebar"));
});

document.getElementById("closeMenu").addEventListener("click", function () {
  document.getElementById("sidebar").classList.remove("open");
});

// /* Xử lý mở danh mục con */
// document.getElementById("openCategories").addEventListener("click", function () {
//     console.log("Hiển thị")
//     document.getElementById("sidebar").classList.remove("open");
//     console.log(document.getElementById("sidebar"))
//     document.getElementById("categorySidebar").classList.add("open");
//     console.log(document.getElementById("categorySidebar"))
// });

// /* Xử lý đóng danh mục con */
// document.getElementById("closeCategoryMenu").addEventListener("click", function () {
//     console.log("đóng nè")
//     document.getElementById("categorySidebar").classList.remove("open");
//     document.getElementById("sidebar").classList.add("open");
// });
document.addEventListener("DOMContentLoaded", function () {
  // Mở menu
  const openMenuBtn = document.getElementById("openMenu");
  const sidebar = document.getElementById("sidebar");
  const closeMenuBtn = document.getElementById("closeMenu");
  const openCategoriesBtn = document.getElementById("openCategories");
  const categorySidebar = document.getElementById("categorySidebar");
  const closeCategoryMenuBtn = document.getElementById("closeCategoryMenu");

  // Mở Sidebar
  openMenuBtn.addEventListener("click", function () {
    sidebar.classList.add("open");
  });

  // Đóng Sidebar
  closeMenuBtn.addEventListener("click", function () {
    sidebar.classList.remove("open");
  });

  // Mở danh mục con
  openCategoriesBtn.addEventListener("click", function () {
    categorySidebar.classList.add("open");
  });

  // Đóng danh mục con
  closeCategoryMenuBtn.addEventListener("click", function () {
    categorySidebar.classList.remove("open");
  });
});

function addToCart(productId, soluong) {
  fetch("/cart/addToCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, soluong }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: data.message,
          showConfirmButton: false,
          timer: 1500,
        });

        updateCartCount();
      } else {
        Swal.fire({
          icon: "warning",
          title: data.message,
        });
      }
    })
    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối server",
      });
    });
}

async function updateCartCount() {
  console.log("🔁 Gọi updateCartCount...");
  try {
    const response = await fetch("/cart/cartCount", {
      method: "POST",
      credentials: "include", // BẮT BUỘC để gửi cookie
    });

    console.log("📡 Đã fetch, status:", response.status);

    if (!response.ok) {
      throw new Error("Không thể kết nối với server");
    }

    const data = await response.json();
    console.log("📦 Dữ liệu nhận được:", data);

    if (data.success) {
      const cartCount = data.cartCount || 0;
      document.querySelector(".cart-badge").textContent = cartCount;
    } else {
      console.error("Không thể lấy số lượng giỏ hàng");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng giỏ hàng:", error);
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Kiểm tra session
    const sessionResponse = await fetch("/user/check-session");
    const sessionData = await sessionResponse.json();

    if (sessionData.loggedIn) {
      // Thay vì isLoggedIn, dùng sessionData.loggedIn
      updateCartCount();
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra session:", error);
  }
});
