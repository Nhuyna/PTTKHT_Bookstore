import OrderModel from "../../model/user/orderModel.js";

const huyDonHang = async (req, res) => {
  const { IDHoaDonXuat } = req.body;
  const ID_KH = req.session.user_id;
  try {
    console.log("👉 Đã vào controller huyDonHang");
    console.log("👉 IDHoaDonXuat:", IDHoaDonXuat);
    console.log("👉 ID_KH:", ID_KH);

    await OrderModel.cancelOrder(IDHoaDonXuat); // ✅ gọi từ object
    res.redirect("/lichsudonhang");
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.redirect(
      "/user/errorPage?error=" + encodeURIComponent("Hủy đơn hàng thất bại.")
    );
  }
};

const handleCheckout = async (req, res, next) => {
  const { idSanPham, soluong, tongTien } = req.body;
  const userId = req.session.user_id;

  if (!userId) {
    return res.redirect(
      "user/account?error=" + encodeURIComponent("Bạn chưa đăng nhập")
    );
  }

  if (!idSanPham || !soluong || !tongTien) {
    return res.redirect(
      "cart/cart?error=" + encodeURIComponent("Thiếu thông tin thanh toán")
    );
  }

  try {
    const items = [];

    if (Array.isArray(idSanPham)) {
      for (let i = 0; i < idSanPham.length; i++) {
        items.push({
          idSanPham: parseInt(idSanPham[i]),
          soLuong: parseInt(soluong[i]),
        });
      }
    } else {
      items.push({
        idSanPham: parseInt(idSanPham),
        soLuong: parseInt(soluong),
      });
    }

    res.redirect(
      "/success?message=" + encodeURIComponent("Đặt hàng thành công!")
    );
  } catch (error) {
    console.error("Lỗi thanh toán:", error);
    res.redirect(
      "user/errorPage?error=" + encodeURIComponent("Lỗi khi xử lý thanh toán")
    );
  }
};

export default { handleCheckout, huyDonHang };
