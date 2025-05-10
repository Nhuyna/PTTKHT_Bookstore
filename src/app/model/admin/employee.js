// const pool = require('../config/index');
import pool from '../../../config/db.js';

class Employee {
    // Xem tất cả nhân viên
    async getAll() {
        const query = 
        `SELECT * FROM NhanVien
        WHERE tinhTrang = 1`;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // search nhân viên
    async search(id) {
        const query = 
        `SELECT * FROM NhanVien 
        WHERE IDNhanVien = ?
        AND tinhTrang = 1`;
        const [rows] = await pool.execute(query, [id]);
        return rows;
    }

    // Thêm một nhân viên mới
    async insert(name, dob, phone, email, street, ward, district, city, position, dow, salary){
        let IDNhanVien;
        let [result] = await pool.execute(
            `INSERT INTO NhanVien (TenNhanVien, NgaySinh, Mail, SDT, ViTri, SoNhaDuong, PhuongXa, QuanHuyen, TinhThanhPho, NgayVaoLam, Luong) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [name, dob, email, phone, position, street, ward, district, city, dow, salary]
        );
        IDNhanVien = result.insertId;
        const query = 
        `INSERT INTO TaiKhoan (ID_NhanVien, ID_NhomQuyen, MatKhau, tinhTrang)
        VALUES (?, NULL, NULL, 0)`;
        await pool.execute(query, [IDNhanVien]);
    }

    // sửa nhân viên
    async update(id, name, dob, phone, email, street, ward, district, city, position, dow, salary){
        const query = 
        `UPDATE NhanVien  
        SET TenNhanVien = ?, 
            NgaySinh = ?, 
            Mail = ?,  
            SDT = ?, 
            ViTri = ?, 
            SoNhaDuong = ?,
            PhuongXa = ?,
            QuanHuyen = ?,
            TinhThanhPho = ?,
            NgayVaoLam = ?,
            Luong = ?
        WHERE IDNhanVien = ?;`;
        await pool.execute(query, [name, dob, email, phone, position, street, ward, district, city, dow, salary, id]);
    }

    // xoá nhân viên 
    async delete(id){
        await pool.execute(
            `UPDATE NhanVien  
            SET tinhTrang = 0
            WHERE IDNhanVien = ?`, [id]
        );
    }
}

// module.exports = new Employee();
export default new Employee();