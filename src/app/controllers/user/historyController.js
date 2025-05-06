import getHoaDonByUserIdAndStatus from "../../model/user/historyModel.js";

function formatCurrencyVND(amount) {
  return (
    parseFloat(amount).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) +
    " đ"
  );
}

const renderHistoryPage = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const status = req.query.status; // lấy status từ URL

    if (!userId) {
      return res.redirect(
        "/user/account?error=" + encodeURIComponent("Chưa đăng nhập")
      );
    }
    let history = await getHoaDonByUserIdAndStatus(userId, status);

    // Xử lý text và màu hiển thị trạng thái
    history.forEach((hd) => {
      switch (hd.TinhTrangDon) {
        case "Cho xac nhan":
          hd.TrangThaiText = "🚚 Chờ xác nhận";
          hd.TrangThaiColor = "text-yellow-600 text-base";
          break;
        case "Cho lay hang":
          hd.TrangThaiText = "🚚 Chờ lấy hàng";
          hd.TrangThaiColor = "text-blue-600 text-base";
          break;
        case "Dang giao hang":
          hd.TrangThaiText = "🚚 Đang giao hàng";
          hd.TrangThaiColor = "text-orange-600 text-base";
          break;
        case "Da giao":
          hd.TrangThaiText = "🚚 Đã giao";
          hd.TrangThaiColor = "text-green-600 text-base";
          break;
        case "Tra hang":
          hd.TrangThaiText = "🚚 Trả hàng";
          hd.TrangThaiColor = "text-purple-600 text-base";
          break;
        case "Da huy":
          hd.TrangThaiText = "🚚 Đã hủy";
          hd.TrangThaiColor = "text-red-600 text-base";
          break;
        default:
          hd.TrangThaiText = "🚚 Không rõ trạng thái";
          hd.TrangThaiColor = "text-gray-500 text-base";
      }
    });

    history.forEach((hoaDons) => {
      hoaDons.DaHuy = hoaDons.TinhTrangDon === "Da huy";
      hoaDons.TongTien = formatCurrencyVND(hoaDons.TongTien);
      hoaDons.ChiTietHoaDonXuat.forEach((hd) => {
        hd.Gia = formatCurrencyVND(hd.Gia);
        hd.ThanhTien = formatCurrencyVND(hd.ThanhTien);
      });
    });

    res.render("user/lichsudonhang", {
      history,
      status: req.query.status || null,
      session: req.session,
    });
  } catch (error) {
    console.error("Lỗi khi tải lịch sử đơn hàng:", error);
    res.redirect(
      "/user/errorPage?error=" +
        encodeURIComponent("Lỗi khi tải lịch sử đơn hàng")
    );
  }
};

export default { renderHistoryPage };
