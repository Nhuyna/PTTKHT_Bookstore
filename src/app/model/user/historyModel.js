import database from "../../../config/db.js";

function formatToReadableDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date)) return "Invalid Date";
  return date.toDateString(); // 👉 Ví dụ: "Fri Jun 09 2023"
}

function groupedByHoaDonXuat(HoaDonXuat) {
  const grouped = {};
  HoaDonXuat.forEach((item) => {
    if (!grouped[item.IDHoaDonXuat]) {
      grouped[item.IDHoaDonXuat] = {
        IDHoaDonXuat: item.IDHoaDonXuat,
        TongTien: item.TongTien,
        TinhTrangDon: item.TinhTrangDon,
        NgayXuat: formatToReadableDate(item.NgayXuat),
        ChiTietHoaDonXuat: [],
      };
    }
    grouped[item.IDHoaDonXuat].ChiTietHoaDonXuat.push(item);
  });

  return Object.values(grouped);
}

const getHoaDonByUserIdAndStatus = async (userId, status) => {
  let query = `
      SELECT *
      FROM KhachHang
      JOIN HoaDonXuat ON KhachHang.ID_KH = HoaDonXuat.ID_KH
      JOIN GiaoHang ON GiaoHang.ID_HDX = HoaDonXuat.IDHoaDonXuat
      JOIN ChiTietHoaDonXuat ON ChiTietHoaDonXuat.IDHoaDonXuat = HoaDonXuat.IDHoaDonXuat
      JOIN SanPham ON ChiTietHoaDonXuat.IDSanPham = SanPham.SanPhamID
      JOIN AnhSP ON AnhSP.ID_SP = SanPham.SanPhamID
      WHERE KhachHang.ID_KH = ?
  `;

  const params = [userId];

  if (status) {
    if (status === "Cho xac nhan") {
      query += ` AND (TinhTrangDon = ? OR TinhTrangDon = ? OR TinhTrangDon = ?)`;
      params.push("Cho xac nhan", "Cho lay hang", "Dang giao hang");
    } else {
      query += ` AND TinhTrangDon = ?`;
      params.push(status);
    }
  }

  // ✅ Luôn thực hiện query
  const [rows] = await database.query(query, params);
  return groupedByHoaDonXuat(rows);
};

export default getHoaDonByUserIdAndStatus;