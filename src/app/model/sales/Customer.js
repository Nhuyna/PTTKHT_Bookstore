import { BaseModel } from "./BaseModel.js";
import db from "../../../config/db.js";

class Customer extends BaseModel {
  constructor() {
    super("KhachHang", "ID_KH");
  }

  async getAllCustomers(
    query = {},
    sortField = "ID_KH",
    sortDir = "asc",
    limit = null
  ) {
    try {
      let sql = `
        SELECT 
          kh.ID_KH, 
          kh.TenKH, 
          kh.TenTK, 
          kh.SDT, 
          kh.NgaySinh, 
          kh.MatKhau,
          kh.TenTK,
          kh.Active,
          kh.TinhTrang
        FROM KhachHang kh
      `;

      console.log("Query:", query);

      const whereClauses = [];
      const params = [];

      // Lọc theo ID
      if (query.filterType === "id") {
        whereClauses.push("kh.ID_KH = ?");
        params.push(query.filterValue);
      }

      // Lọc theo tên khách hàng
      if (query.filterType === "name") {
        whereClauses.push("kh.TenKH LIKE ?");
        params.push(`%${query.filterValue}%`);
      }
      // Lọc theo số điện thoại
      if (query.filterType == "phone") {
        whereClauses.push("kh.SDT LIKE ?");
        params.push(`%${query.filterValue}%`);
      }

      // Nếu có điều kiện WHERE
      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      // Sắp xếp
      if (sortField && sortDir) {
        sql += ` ORDER BY ${sortField} ${sortDir}`;
      }

      // Giới hạn kết quả
      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      const [rows] = await db.query(sql, params);
      return rows;
    } catch (error) {
      console.error("Error retrieving customers:", error);
      throw error;
    }
  }

  async getCustomerById(id) {
    try {
      const sql = `
        SELECT 
          kh.ID_KH, 
          kh.TenKH, 
          kh.TenTK, 
          kh.SDT, 
          kh.NgaySinh, 
          kh.MatKhau,
          kh.TenTK,
          kh.Active,
          COUNT(DISTINCT hdx.IDHoaDonXuat) as SoDonHang,
          SUM(hdx.TongTien) as TongChiTieu
        FROM KhachHang kh, KhachHang kh2
        LEFT JOIN HoaDonXuat hdx ON kh2.ID_KH = hdx.ID_KH
        LEFT JOIN GiaoHang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
        WHERE kh.ID_KH = ? AND gh.TinhTrangDon = 'Đã giao' AND TinhTrangThanhToan = 'Đã thanh toán'
        GROUP BY kh.ID_KH

      `;

      const [rows] = await db.query(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error retrieving customer with ID ${id}:`, error);
      throw error;
    }
  }

  async getCustomerOrders(customerId) {
    try {
      const sql = `
        SELECT 
          hdx.IDHoaDonXuat, 
          hdx.NgayXuat,
          hdx.PhuongThucThanhToan,
          hdx.TongTien,
          hdx.TinhTrangThanhToan,
          gh.TinhTrangDon
        FROM HoaDonXuat hdx
        LEFT JOIN GiaoHang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
        WHERE hdx.ID_KH = ?
        ORDER BY hdx.NgayXuat DESC
      `;

      const [rows] = await db.query(sql, [customerId]);
      return rows;
    } catch (error) {
      console.error(
        `Error retrieving orders for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  async deleteCustomer(customerId) {
    try {
      // First, check if the customer exists
      const checkSql = `SELECT ID_KH FROM KhachHang WHERE ID_KH = ?`;
      const [checkResult] = await db.query(checkSql, [customerId]);

      if (checkResult.length === 0) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }

      const updateSql = `UPDATE KhachHang SET TinhTrang = 0 WHERE ID_KH = ?`;
      await db.query(updateSql, [customerId]);
      return {
        success: true,
        message: "Khách hàng đã được đánh dấu là không hoạt động",
        softDelete: true,
      };
    } catch (error) {
      console.error(`Error deleting customer with ID ${customerId}:`, error);
      throw error;
    }
  }

  async createCustomer(customerData) {
    try {
      // Kiểm tra tên tài khoản đã tồn tại chưa
      if (customerData.TenTK) {
        const checkUserSql = `SELECT COUNT(*) as count FROM KhachHang WHERE TenTK = ?`;
        const [userResult, field] = await db.query(checkUserSql, [
          customerData.TenTK,
        ]);
        console.log("User Result:", userResult);
        if (userResult[0].count > 0) {
          console.log("Tên tài khoản đã tồn tại");
          throw new Error("Tên tài khoản đã tồn tại");
        }
      }

      // Kiểm tra số điện thoại đã tồn tại chưa
      if (customerData.SDT) {
        const checkPhoneSql = `SELECT COUNT(*) as count FROM KhachHang WHERE SDT = ?`;
        const [phoneResult, field] = await db.query(checkPhoneSql, [
          customerData.SDT,
        ]);

        if (phoneResult[0].count > 0) {
          console.log("Số điện thoại đã tồn tại");
          throw new Error("Số điện thoại đã tồn tại");
        }
      }

      // Chuẩn bị câu lệnh SQL để tạo khách hàng mới
      const insertSql = `
        INSERT INTO KhachHang (
          TenKH,
          TenTK,
          MatKhau,
          SDT,
          NgaySinh,
          Active,
          TinhTrang
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      // Thiết lập giá trị mặc định nếu không được cung cấp
      const values = [
        customerData.TenKH,
        customerData.TenTK || null,
        customerData.MatKhau || null,
        customerData.SDT || null,
        customerData.NgaySinh || null,
        customerData.Active !== undefined ? customerData.Active : 1,
        customerData.TinhTrang !== undefined ? customerData.TinhTrang : 1,
      ];
      console.log("Values:", values);
      // Thực hiện truy vấn
      const [result] = await db.query(insertSql, values);

      return {
        success: true,
        message: "Khách hàng đã được tạo thành công",
        customerId: result.insertId,
      };
    } catch (error) {
      console.error("Error creating customer:", error);
      return {
        success: false,
        message: error.message || "Đã xảy ra lỗi khi tạo khách hàng",
      };
    }
  }

  async updateCustomer(customerId, customerData) {
    try {
      // Kiểm tra xem khách hàng có tồn tại không
      const checkSql = `SELECT ID_KH FROM KhachHang WHERE ID_KH = ?`;
      const [checkResult, field] = await db.query(checkSql, [customerId]);

      if (checkResult.length === 0) {
        return {
          success: false,
          message: `Không tìm thấy khách hàng với ID ${customerId}`,
        };
      }

      // Kiểm tra tên tài khoản đã tồn tại chưa (nếu có cập nhật tên tài khoản)
      if (customerData.TenTK) {
        const checkUserSql = `SELECT COUNT(*) as count FROM KhachHang WHERE TenTK = ? AND ID_KH != ?`;
        const [userResult, field] = await db.query(checkUserSql, [
          customerData.TenTK,
          customerId,
        ]);

        if (userResult[0].count > 0) {
          return {
            success: false,
            message: "Tên tài khoản đã tồn tại",
          };
        }
      }

      // Kiểm tra số điện thoại đã tồn tại chưa (nếu có cập nhật số điện thoại)
      if (customerData.SDT) {
        const checkPhoneSql = `SELECT COUNT(*) as count FROM KhachHang WHERE SDT = ? AND ID_KH != ?`;
        const [phoneResult, field] = await db.query(checkPhoneSql, [
          customerData.SDT,
          customerId,
        ]);

        if (phoneResult[0].count > 0) {
          return {
            success: false,
            message: "Số điện thoại đã tồn tại",
          };
        }
      }

      // Chuẩn bị câu lệnh SQL và tham số cho cập nhật
      const updateFields = [];
      const updateValues = [];

      // Chỉ cập nhật các trường có giá trị
      if (customerData.TenKH !== undefined) {
        updateFields.push("TenKH = ?");
        updateValues.push(customerData.TenKH);
      }

      if (customerData.TenTK !== undefined) {
        updateFields.push("TenTK = ?");
        updateValues.push(customerData.TenTK || null);
      }

      // Chỉ cập nhật mật khẩu nếu có cung cấp mật khẩu mới
      if (customerData.MatKhau) {
        updateFields.push("MatKhau = ?");
        updateValues.push(customerData.MatKhau);
      }

      if (customerData.SDT !== undefined) {
        updateFields.push("SDT = ?");
        updateValues.push(customerData.SDT || null);
      }

      if (customerData.NgaySinh !== undefined) {
        updateFields.push("NgaySinh = ?");
        updateValues.push(customerData.NgaySinh || null);
      }

      if (customerData.Active !== undefined) {
        updateFields.push("Active = ?");
        updateValues.push(customerData.Active);
      }

      if (customerData.TinhTrang !== undefined) {
        updateFields.push("TinhTrang = ?");
        updateValues.push(customerData.TinhTrang);
      }

      // Nếu không có trường nào để cập nhật
      if (updateFields.length === 0) {
        return {
          success: false,
          message: "Không có thông tin nào để cập nhật",
        };
      }

      // Tạo câu lệnh SQL cập nhật
      const updateSql = `UPDATE KhachHang SET ${updateFields.join(
        ", "
      )} WHERE ID_KH = ?`;

      // Thêm ID khách hàng vào cuối mảng tham số
      updateValues.push(customerId);

      // Thực hiện truy vấn cập nhật
      await db.query(updateSql, updateValues);

      return {
        success: true,
        message: "Thông tin khách hàng đã được cập nhật thành công",
      };
    } catch (error) {
      console.error(`Error updating customer with ID ${customerId}:`, error);
      return {
        success: false,
        message:
          error.message || "Đã xảy ra lỗi khi cập nhật thông tin khách hàng",
      };
    }
  }
}

export default Customer;
