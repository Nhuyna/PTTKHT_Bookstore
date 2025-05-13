import database from "../../../config/db.js";

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

  return result.insertId;
};

const createChiTietHoaDonXuat = async ({ ID_HoaDonXuat, ID_SP, SoLuong, DonGia }) => {
  const query = `
    INSERT INTO ChiTietHoaDonXuat (IDHoaDonXuat, IDSanPham, SoLuong, ThanhTien)
    VALUES (?, ?, ?, ?)
  `;
  await database.query(query, [ID_HoaDonXuat, ID_SP, SoLuong, DonGia]);
};



const capNhatDiaChi = async ({
  ID_KH,
  TenNguoiNhan,
  SoDienThoai,
  SoNhaDuong,
  QuanHuyen,
  TinhThanhPho
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
const themDiaChi = async ({
  ID_KH,
  TenNguoiNhan,
  SoDienThoai,
  SoNhaDuong,
  QuanHuyen,
  TinhThanhPho,
  PhuongXa
}) => {
  try {
    const sql = `
        insert into DiaChi_KH
        (TenNguoiNhan ,SoDienThoai ,SoNhaDuong,QuanHuyen,TinhThanhPho,ID_KH,PhuongXa) values
          (?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?)
      `;
    const values = [
      TenNguoiNhan,
      SoDienThoai,
      SoNhaDuong,
      QuanHuyen,
      TinhThanhPho,
      ID_KH,
      PhuongXa
    ];
    const [result] = await database.query(sql, values);
    return result.affectedRows;
  } catch (error) {
    console.error("❌ Lỗi khi thêm địa chỉ:", error);
    throw error;
  }
};

const cancelOrder = async (ID_HDX) => {
  const query = `
      UPDATE GiaoHang
      SET TinhTrangDon = 'Đã hủy'
      WHERE ID_HDX = ?
    `;

  try {
    const [result] = await database.query(query, [ID_HDX]);
    // console.log("✅ Update result:", result);
  } catch (err) {
    console.error("❌ Lỗi trong cancelOrder:", err.message);
    throw err; // để controller bắt lỗi tiếp
  }
};
const createGiaoHang = async (data) => {
  const query = `
    INSERT INTO GiaoHang (ID_HDX, IDNhanVien, IDDiaChi, NgayGiaoHang, TinhTrangDon)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [rows] = await database.query(query, [
    data.ID_HDX,
    data.IDNhanVien,
    data.IDDiaChi,
    data.NgayGiaoHang,
    data.TinhTrangDon,
  ]);
  return rows.insertId;
};



export default {themDiaChi, createHoaDonXuat, capNhatDiaChi, cancelOrder ,createChiTietHoaDonXuat,createGiaoHang };
