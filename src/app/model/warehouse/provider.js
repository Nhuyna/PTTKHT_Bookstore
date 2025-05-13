// const pool = require('../config/index');
import pool from "../../../config/db.js";

class Provider {
  // Xem tất cả thông tin ncc
  async getAll() {
    const query = `SELECT * FROM NCC
        WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Xem tất cả thông tin ncc đã xóa
  async getAll_delete() {
    const query = `SELECT * FROM NCC
        WHERE tinhTrang = 0`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // search ncc
  async search(id) {
    const query = `SELECT * FROM NCC
        WHERE ID_NCC = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  }

  // get receipt of provider
  async get_receipt(id){
    const query = 
    `SELECT HoaDonNhap.IDHoaDonNhap, NCC.TenNCC, NhanVien.TenNhanVien, NgayNhap, TongTien, TinhTrangThanhToan
    FROM HoaDonNhap 
    LEFT JOIN NCC ON HoaDonNhap.ID_NCC = NCC.ID_NCC
    LEFT JOIN NhanVien ON HoaDonNhap.IDNhanVien = NhanVien.IDNhanVien
    WHERE NCC.ID_NCC = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  }

  // search ncc
  async search_provider(keyword) {
    const input_query = keyword.toLowerCase();
    const str = `%${input_query}%`;
    const query = `SELECT * FROM NCC 
        WHERE (
            LOWER(ID_NCC) LIKE ? OR
            LOWER(TenNCC) LIKE ? OR
            LOWER(SDT) LIKE ? OR
            LOWER(Email) LIKE ? OR
            LOWER(SoNhaDuong) LIKE ? OR
            LOWER(PhuongXa) LIKE ? OR
            LOWER(QuanHuyen) LIKE ? OR
            LOWER(TinhThanhPho) LIKE ?
        )
        AND tinhTrang = 1`;
    const [rows] = await pool.execute(query, [
      str,
      str,
      str,
      str,
      str,
      str,
      str,
      str,
    ]);
    return rows;
  }

  // thêm ncc mới
  async insert(name, phone, email, street, ward, district, city) {
    const query = `INSERT INTO NCC (TenNCC, SDT, Email, SoNhaDuong, PhuongXa, QuanHuyen, TinhThanhPho) VALUES
        (?, ?, ?, ?, ?, ?, ?)`;
    const [rows] = await pool.execute(query, [
      name,
      phone,
      email,
      street,
      ward,
      district,
      city,
    ]);
    return rows;
  }

  // sửa thông tin ncc
  async update(id, name, phone, email, street, ward, district, city) {
    const query = `UPDATE NCC  
        SET TenNCC = ?,  
            SDT = ?,  
            Email = ?,  
            SoNhaDuong = ?,
            PhuongXa = ?,
            QuanHuyen = ?,
            TinhThanhPho = ?
        WHERE ID_NCC = ?`;
    const [rows] = await pool.execute(query, [
      name,
      phone,
      email,
      street,
      ward,
      district,
      city,
      id,
    ]);
    return rows;
  }

  // xoá ncc
  async delete(id) {
    // xoá ncc
    await pool.execute(
      `UPDATE NCC 
            SET tinhTrang = 0
            WHERE ID_NCC = ?`,
      [id]
    );
  }
}

// module.exports = new Provider();
export default new Provider();
