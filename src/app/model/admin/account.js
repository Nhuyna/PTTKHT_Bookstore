// const pool = require('../config/index');
import pool from '../../../config/db.js';

class Account {
    // Xem tất cả nhân viên
    async getAll() {
        const query = 
        `SELECT TaiKhoan.ID_NhanVien, NhanVien.TenNhanVien, NhomQuyen.TenNhomQuyen, TaiKhoan.MatKhau
        FROM TaiKhoan
        JOIN NhanVien ON TaiKhoan.ID_NhanVien = NhanVien.IDNhanVien
        JOIN NhomQuyen ON TaiKhoan.ID_NhomQuyen = NhomQuyen.ID_NhomQuyen
        WHERE TaiKhoan.tinhTrang = 1`;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // search nhân viên
    async search(id) {
        const query = 
        `SELECT TaiKhoan.ID_NhanVien, NhanVien.TenNhanVien, NhomQuyen.TenNhomQuyen, TaiKhoan.MatKhau
        FROM TaiKhoan
        JOIN NhanVien ON TaiKhoan.ID_NhanVien = NhanVien.IDNhanVien
        JOIN NhomQuyen ON TaiKhoan.ID_NhomQuyen = NhomQuyen.ID_NhomQuyen
        WHERE ID_NhanVien = ?
        AND TaiKhoan.tinhTrang = 1`;
        const [rows] = await pool.execute(query, [id]);
        return rows;
    }

    // lấy thông tin nhân viên
    async get_employee() {
        const query = 
        `SELECT CONCAT(IDNhanVien, ' - ', TenNhanVien) AS employee_info 
        FROM NhanVien
        JOIN TaiKhoan ON NhanVien.IDNhanVien = TaiKhoan.ID_NhanVien
        WHERE NhanVien.tinhTrang = 1
        AND TaiKhoan.ID_NhomQuyen IS NULL
        AND TaiKhoan.MatKhau IS NULL`;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Lấy thông tin nhóm quyền
    async get_permission() {
        const query = 
        `SELECT ID_NhomQuyen, CONCAT(ID_NhomQuyen, ' - ', TenNhomQuyen) AS permission_info
        FROM NhomQuyen
        WHERE TinhTrang = 1`;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // lấy thông tin nhân viên
    async get_account_info(id) {
        const query = 
        `SELECT CONCAT(NhanVien.IDNhanVien, ' - ', TenNhanVien) AS employee_info, TaiKhoan.ID_NhomQuyen, 
        CONCAT(NhomQuyen.ID_NhomQuyen, ' - ', TenNhomQuyen) AS permission_info, TaiKhoan.MatKhau
        FROM NhanVien
        JOIN TaiKhoan ON NhanVien.IDNhanVien = TaiKhoan.ID_NhanVien
        JOIN NhomQuyen ON TaiKhoan.ID_NhomQuyen = NhomQuyen.ID_NhomQuyen
        WHERE NhanVien.tinhTrang = 1
        AND TaiKhoan.ID_NhomQuyen IS NOT NULL
        AND TaiKhoan.MatKhau IS NOT NULL
        AND NhanVien.IDNhanVien = ?`;
        const [rows] = await pool.execute(query, [id]);
        return rows;
    }

    // sửa nhân viên
    async update_old_password(employee_id, permission_id, password){
        const query = 
        `UPDATE TaiKhoan  
        SET ID_NhomQuyen = ?,
            tinhTrang = 1
        WHERE ID_NhanVien = ?`;
        await pool.execute(query, [permission_id, password, employee_id]);
    }

    async update_change_password(employee_id, permission_id, password){
        const query = 
        `UPDATE TaiKhoan  
        SET ID_NhomQuyen = ?, 
            MatKhau = ?,
            tinhTrang = 1
        WHERE ID_NhanVien = ?`;
        await pool.execute(query, [permission_id, password, employee_id]);
    }

    // xoá nhân viên 
    async delete(id){
        await pool.execute(
            `UPDATE TaiKhoan  
            SET tinhTrang = 0,
                ID_NhomQuyen = NULL,
                MatKhau = NULL
            WHERE ID_NhanVien = ?`, [id]
        );
    }
}

// module.exports = new Account();
export default new Account();