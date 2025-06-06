import OrderModel from "../../model/user/orderModel.js";

const huyDonHang = async (req, res) => {
  const { IDHoaDonXuat, cancel_reason } = req.body;
  const ID_KH = req.session.user_id;
  try {
    // console.log("👉 Đã vào controller huyDonHang");
    // console.log("👉 IDHoaDonXuat:", IDHoaDonXuat);
    // console.log("👉 ID_KH:", ID_KH);

    await OrderModel.cancelOrder(IDHoaDonXuat, cancel_reason);
    res.json({ success: true, message: "Hủy đơn hàng thành công." });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({ success: false, message: "Hủy đơn hàng thất bại." });
  }
};
const TraHang= async (req, res) => {
  const { IDHoaDonXuat, reason } = req.body;
  const ID_KH = req.session.user_id;
  try {
    console.log("👉 Đã vào controller TraHang");
    console.log("👉 IDHoaDonXuat:", IDHoaDonXuat);
    console.log("👉 ID_KH:", ID_KH);

    await OrderModel.TraHang(IDHoaDonXuat, reason);
    res.json({ success: true, message: "Yêu cầu trả thành công." });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({ success: false, message: "Yêu cầu trả thất bại." });
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

export default { handleCheckout, huyDonHang,TraHang };
