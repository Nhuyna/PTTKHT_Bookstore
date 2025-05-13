// const pool = require('../config/index');
import pool from "../../../config/db.js";

class Dashboard {
  // Hiển thị thông tin chung
  async get_provider_recently() {
    const query = `SELECT NCC.TenNCC
        FROM HoaDonNhap
        LEFT JOIN NCC ON HoaDonNhap.ID_NCC = NCC.ID_NCC
        ORDER BY ABS(DATEDIFF(NgayNhap, CURDATE()))
        LIMIT 8`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async get_receipt_recently() {
    const query = `SELECT IDHoaDonNhap, TongTien, NhanVien.TenNhanVien
        FROM HoaDonNhap
        JOIN NhanVien ON HoaDonNhap.IDNhanVien = NhanVien.IDNhanVien
        ORDER BY ABS(DATEDIFF(NgayNhap, CURDATE()))
        LIMIT 9`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async get_sum_of_product() {
    const query = `SELECT COUNT(SanPhamID) as SLsanpham
        FROM SanPham 
        WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async get_sum_of_provider() {
    const query = `SELECT COUNT(ID_NCC) as SLncc
        FROM NCC 
        WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async get_sum_of_receipt() {
    const query = `SELECT COUNT(IDHoaDonNhap) as SLhoadon 
        FROM HoaDonNhap 
        WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async get_sum_of_paid_money() {
    const query = `SELECT SUM(TongTien) as TongHoaDon
        FROM HoaDonNhap 
        WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }
}

// module.exports = new Dashboard();
export default new Dashboard();
