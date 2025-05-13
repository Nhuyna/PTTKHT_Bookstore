// const pool = require('../config/index');
import pool from "../../../config/db.js";

class Receipt {
  // Xem tất cả thông tin hóa đơn
  async getAll() {
    const query = `SELECT HoaDonNhap.IDHoaDonNhap, NCC.TenNCC, NhanVien.TenNhanVien, NgayNhap, TongTien, TinhTrangThanhToan
        FROM HoaDonNhap 
        LEFT JOIN NCC ON HoaDonNhap.ID_NCC = NCC.ID_NCC
        LEFT JOIN NhanVien ON HoaDonNhap.IDNhanVien = NhanVien.IDNhanVien`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // search hóa đơn
  async search(id) {
    const query = `SELECT HoaDonNhap.IDHoaDonNhap, NCC.TenNCC, NhanVien.TenNhanVien, NgayNhap, TongTien, TinhTrangThanhToan
        FROM HoaDonNhap 
        LEFT JOIN NCC ON HoaDonNhap.ID_NCC = NCC.ID_NCC
        LEFT JOIN NhanVien ON HoaDonNhap.IDNhanVien = NhanVien.IDNhanVien
        WHERE HoaDonNhap.IDHoaDonNhap = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  }

  // xem thông tin chi tiết hóa đơn
  async view(id) {
    const query = `SELECT HoaDonNhap.NgayNhap, HoaDonNhap.TongTien, HoaDonNhap.TinhTrangThanhToan, NCC.ID_NCC, NCC.TenNCC, 
        NCC.SDT, NCC.Email, NCC.SoNhaDuong, NCC.PhuongXa, NCC.QuanHuyen, NCC.TinhThanhPho, NhanVien.IDNhanVien, NhanVien.TenNhanVien
        FROM ChiTietHoaDonNhap 
        LEFT JOIN HoaDonNhap ON ChiTietHoaDonNhap.IDHoaDonNhap = HoaDonNhap.IDHoaDonNhap
        LEFT JOIN NCC ON HoaDonNhap.ID_NCC = NCC.ID_NCC
        LEFT JOIN NhanVien ON HoaDonNhap.IDNhanVien = NhanVien.IDNhanVien
        WHERE ChiTietHoaDonNhap.IDHoaDonNhap = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  }

  // xem sản phẩm trong chi tiết hóa đơn
  async view_product_in_receipt(id) {
    const query = `SELECT ChiTietHoaDonNhap.IDSanPham, SanPham.TenSanPham, AnhSP.Anh, TacGia.TenTacGia, GiaNhap, SoLuong, (GiaNhap * SoLuong) as ThanhTien
        FROM ChiTietHoaDonNhap 
        LEFT JOIN HoaDonNhap ON ChiTietHoaDonNhap.IDHoaDonNhap = HoaDonNhap.IDHoaDonNhap
        LEFT JOIN SanPham ON ChiTietHoaDonNhap.IDSanPham = SanPham.SanPhamID
        LEFT JOIN AnhSP ON SanPham.SanPhamID = AnhSP.ID_SP AND AnhSP.STT = 1
        LEFT JOIN SP_TG ON SanPham.SanPhamID = SP_TG.SanPhamID
        LEFT JOIN TacGia ON SP_TG.IDTacGia = TacGia.IDTacGia
        WHERE ChiTietHoaDonNhap.IDHoaDonNhap = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  }

  // lấy thông tin ncc
  async get_provider() {
    const query = `SELECT CONCAT(ID_NCC, ' - ', TenNCC) AS provider_info FROM NCC
    WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // lấy thông tin nhân viên
  async get_employee() {
    const query = `SELECT CONCAT(IDNhanVien, ' - ', TenNhanVien) AS employee_info FROM NhanVien
    WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // lấy thông tin nhân viên
  async get_product() {
    const query = 
    `SELECT SanPhamID, TenSanPham, CONCAT(SanPhamID, ' - ', TenSanPham) AS product_info FROM SanPham
    WHERE tinhTrang = 1`;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // thêm hóa đơn
  async insert(provider_id, employee_id, product_details) {
    // tạo hóa đơn mới
    let receipt_id;
    let [result] = await pool.execute(
      `INSERT INTO HoaDonNhap (ID_NCC, IDNhanVien, NgayNhap) 
            VALUES (?, ?, NOW())`,
      [provider_id, employee_id]
    );
    receipt_id = result.insertId;

    // thêm sản phẩm vào hóa đơn
    for (const product of product_details) {
      const { productName, quantity, price } = product;
      let product_id;
      let [row] = await pool.execute(
        `SELECT SanPhamID FROM SanPham WHERE TenSanPham = ?`,
        [productName]
      );
      product_id = row[0].SanPhamID;
      await pool.execute(
        `INSERT INTO ChiTietHoaDonNhap (IDHoaDonNhap, IDSanPham, SoLuong, GiaNhap) 
                VALUES (?, ?, ?, ?)`,
        [receipt_id, product_id, quantity, price]
      );
      await pool.execute(
        `UPDATE SanPham
                SET SoLuongTon = SoLuongTon + ?
                WHERE SanPhamID = ?`,
        [quantity, product_id]
      );
    }
  }

  // lấy thông tin hóa đơn
  async get_receipt(id) {
    const query = `SELECT HoaDonNhap.IDHoaDonNhap, CONCAT(NCC.ID_NCC, ' - ', NCC.TenNCC) AS provider_info, 
        CONCAT(NhanVien.IDNhanVien, ' - ', NhanVien.TenNhanVien) AS employee_info, TinhTrangThanhToan
        FROM HoaDonNhap 
        LEFT JOIN NCC ON HoaDonNhap.ID_NCC = NCC.ID_NCC
        LEFT JOIN NhanVien ON HoaDonNhap.IDNhanVien = NhanVien.IDNhanVien
        WHERE HoaDonNhap.IDHoaDonNhap = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  }

  // lấy thông tin sp trong hóa đơm
  async get_receipt_detail(id) {
    const query = `SELECT ChiTietHoaDonNhap.IDSanPham, SanPham.TenSanPham, SoLuong, GiaNhap
        FROM ChiTietHoaDonNhap
        LEFT JOIN SanPham ON ChiTietHoaDonNhap.IDSanPham = SanPham.SanPhamID
        WHERE ChiTietHoaDonNhap.IDHoaDonNhap = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows;
  }

  // sửa hóa đơn
  async update(receipt_id, provider_id, employee_id, product_details) {
    // sửa thông tin hóa đơn
    await pool.execute(
      `UPDATE HoaDonNhap
            SET ID_NCC = ?,
                IDNhanVien = ?
            WHERE IDHoaDonNhap = ?`,
      [provider_id, employee_id, receipt_id]
    );

    // lấy thông tin của số lượng tồn
    const [old_product_details] = await pool.execute(
      `SELECT IDSanPham, SoLuong
            FROM ChiTietHoaDonNhap 
            WHERE IDHoaDonNhap = ?`,
      [receipt_id]
    );

    // cập nhật SL tồn
    for (const old_product of old_product_details) {
      const product_id = old_product.IDSanPham;
      const quantity = old_product.SoLuong;
      await pool.execute(
        `UPDATE SanPham
                SET SoLuongTon = SoLuongTon - ?
                WHERE SanPhamID = ?`,
        [quantity, product_id]
      );
    }

    // xóa sp cũ
    await pool.execute(`DELETE FROM ChiTietHoaDonNhap WHERE IDHoaDonNhap = ?`, [
      receipt_id,
    ]);

    // thêm sản phẩm vào hóa đơn
    for (const product of product_details) {
      const { productName, quantity, price } = product;
      let product_id;
      let [row] = await pool.execute(
        `SELECT SanPhamID FROM SanPham WHERE TenSanPham = ?`,
        [productName]
      );
      product_id = row[0].SanPhamID;
      await pool.execute(
        `INSERT INTO ChiTietHoaDonNhap (IDHoaDonNhap, IDSanPham, SoLuong, GiaNhap) 
                VALUES (?, ?, ?, ?)`,
        [receipt_id, product_id, quantity, price]
      );
      await pool.execute(
        `UPDATE SanPham
                SET SoLuongTon = SoLuongTon + ?
                WHERE SanPhamID = ?`,
        [quantity, product_id]
      );
    }
  }
}

// module.exports = new Receipt();
export default new Receipt();
