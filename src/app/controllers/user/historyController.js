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
    const status = req.query.status;

    if (!userId) {
      return res.redirect(
        "/user/account?error=" + encodeURIComponent("Chưa đăng nhập")
      );
    }
    let history = await getHoaDonByUserIdAndStatus(userId, status);
    history.forEach((hd) => {
      // console.log(JSON.stringify(hd.ChiTietHoaDonXuat, null, 2));
      // console.log("hd", hd.TinhTrangDon);
      switch (hd.TinhTrangDon) {
        case "Chờ xác nhận":
          hd.TrangThaiText = "🚚 Chờ xác nhận";
          hd.TrangThaiColor = "text-yellow-600 text-base";
          break;
        case "Chờ lấy hàng":
          hd.TrangThaiText = "🚚 Chờ lấy hàng";
          hd.TrangThaiColor = "text-blue-600 text-base";
          break;
        case "Đang giao hàng":
          hd.TrangThaiText = "🚚 Đang giao hàng";
          hd.TrangThaiColor = "text-orange-600 text-base";
          break;
        case "Đã giao":
          hd.TrangThaiText = "🚚 Đã giao";
          hd.TrangThaiColor = "text-green-600 text-base";
          break;
        case "Trả hàng":
          hd.TrangThaiText = "🚚 Trả hàng";
          hd.TrangThaiColor = "text-purple-600 text-base";
          break;
        case "Đã hủy":
          hd.TrangThaiText = "🚚 Đã hủy";
          hd.TrangThaiColor = "text-red-600 text-base";
          break;
        default:
          hd.TrangThaiText = "";
          hd.TrangThaiColor = "";
      }
    });
    history.forEach((hoaDons) => {
      hoaDons.DaHuy =( hoaDons.TinhTrangDon === "Chờ xác nhận" || hoaDons.TinhTrangDon === "Chờ lấy hàng" || hoaDons.TinhTrangDon === "Đang giao hàng");
      const ngayGiao = new Date(hoaDons.NgayXuat);
      const ngayHienTai = new Date();

      const ms1Ngay = 24 * 60 * 60 * 1000; 
      const soNgayTrenLech = (ngayHienTai - ngayGiao) / ms1Ngay;

      const coTheTraHang = (hoaDons.TinhTrangDon === "Đã giao" && soNgayTrenLech <= 3);
      hoaDons.HienTraHang = hoaDons.TinhTrangDon === "Đã giao";
      hoaDons.TraHang = coTheTraHang;
      hoaDons.TraHangClass = coTheTraHang ? "" : "cursor-not-allowed opacity-50";


      console.log("trả hanggfffffffffffff",hoaDons.TraHang)
      hoaDons.TongTien = formatCurrencyVND(hoaDons.TongTien);
      hoaDons.ChiTietHoaDonXuat.forEach((hd) => {
        hd.Gia = formatCurrencyVND(hd.Gia);
        hd.ThanhTien = formatCurrencyVND(hd.ThanhTien);
      });
    });
    console.log("history", history);
    res.render("user/lichsudonhang", {
      history,
      status: req.query.status,
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
