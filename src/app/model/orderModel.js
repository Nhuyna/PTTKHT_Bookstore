const database = require("../../config/db");

const createHoaDonXuat = async ({
  ID_KH,
  IDNhanVien = null,
  ID_GiamGia = null,
  PhuongThucThanhToan,
  TongTien,
  TinhTrangThanhToan,
}) => {
  const query = `
      INSERT INTO HoaDonXuat 
        (ID_KH, IDNhanVien, ID_GiamGia, PhuongThucThanhToan, TongTien, TinhTrangThanhToan)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

  const [result] = await database.query(query, [
    ID_KH,
    IDNhanVien,
    ID_GiamGia,
    PhuongThucThanhToan,
    TongTien,
    TinhTrangThanhToan,
  ]);

  return result.insertId; // trả về ID của hoá đơn mới
};

const capNhatDiaChi = async ({
  ID_KH,
  TenNguoiNhan,
  SoDienThoai,
  SoNhaDuong,
  QuanHuyen,
  TinhThanhPho,
}) => {
  try {
    const sql = `
        UPDATE DiaChi_KH SET
          TenNguoiNhan = ?,
          SoDienThoai = ?,
          SoNhaDuong = ?,
          QuanHuyen = ?,
          TinhThanhPho = ?
        WHERE ID_KH = ?
      `;
    const values = [
      TenNguoiNhan,
      SoDienThoai,
      SoNhaDuong,
      QuanHuyen,
      TinhThanhPho,
      ID_KH,
    ];
    const [result] = await database.query(sql, values);
    return result.affectedRows;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật địa chỉ:", error);
    throw error;
  }
};
const cancelOrder = async (ID_HDX) => {
  const query = `
      UPDATE GiaoHang
      SET TinhTrangDon = 'Da huy'
      WHERE ID_HDX = ?
    `;

  try {
    const [result] = await database.query(query, [ID_HDX]);
    console.log("✅ Update result:", result);
  } catch (err) {
    console.error("❌ Lỗi trong cancelOrder:", err.message);
    throw err; // để controller bắt lỗi tiếp
  }
};

module.exports = {
  createHoaDonXuat,
  capNhatDiaChi,
  cancelOrder,
};
