import db from "../../../config/db.js";
import { BaseModel } from "./BaseModel.js"; // chỉnh path nếu cần

const _status = {
  pending: "Chờ xác nhận",
  processing: "Chờ lấy hàng",
  shipping: "Đang giao hàng",
  completed: "Đã giao",
  cancelled: "Đã hủy",
  returned: "Trả hàng",
};

const _paymentMethod = {
  cod: "Tiền mặt",
  bank: "Chuyển khoản",
  credit: "Credit card",
};

const _paymentStatus = {
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
  refunded: "Đã hoàn tiền",
  not_refunded: "Chưa hoàn tiền",
};

export class Order extends BaseModel {
  constructor() {
    super("hoadonxuat", "ID_HDX");
  }

  /**
   * @param {{
   *  id?: number,
   *  status?: string,
   *  fromDate?: Date,
   *  toDate?: Date,
   *  paymentMethod?: string,
   *  paymentStatus?: string,
   * }} body
   * @param {string|null} sortField
   * @param {string} sortDir
   * @param {number|null} limit
   * *
   */
  async findAll(body = {}, sortField = null, sortDir = "asc", limit = null) {
    try {
      let sql = `
         SELECT hdx.IDHoaDonXuat, dckh.TenNguoiNhan, dckh.SoDienThoai, dckh.SoNhaDuong, 
                dckh.QuanHuyen, dckh.TinhThanhPho, hdx.NgayXuat, 
                hdx.TongTien, hdx.PhuongThucThanhToan, gh.TinhTrangDon, hdx.TinhTrangThanhToan
         FROM hoadonxuat hdx
         JOIN giaohang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
         JOIN diachi_kh dckh ON dckh.ID_DCKH = gh.IDDiaChi`;

      let conditions = [];
      let params = [];

      console.log("body", body);
      console.log(_status[body.status]);
      console.log(typeof body.fromDate);

      if (body.id) {
        conditions.push("hdx.IDHoaDonXuat = ?");
        params.push(body.id);
      }

      if (body.status) {
        conditions.push("gh.TinhTrangDon = ?");
        let status = _status[body.status];
        params.push(status);
      }

      if (body.paymentMethod) {
        conditions.push("hdx.PhuongThucThanhToan = ?");
        params.push(_paymentMethod[body.paymentMethod]);
      }

      if (body.paymentStatus) {
        conditions.push("hdx.TinhTrangThanhToan = ?");
        params.push(_paymentStatus[body.paymentStatus]);
      }

      if (body.fromDate && body.toDate) {
        conditions.push("hdx.NgayXuat BETWEEN ? AND ?");
        params.push(body.fromDate, body.toDate);
      } else if (body.fromDate) {
        conditions.push("hdx.NgayXuat = ?");
        params.push(body.fromDate);
      }

      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      // Add ORDER BY clause if sortField is provided
      if (sortField) {
        let orderByField;
        switch (sortField) {
          case "id":
            orderByField = "hdx.IDHoaDonXuat";
            break;
          case "customer":
            orderByField = "dckh.TenNguoiNhan";
            break;
          case "date":
            orderByField = "hdx.NgayXuat";
            break;
          case "amount":
            orderByField = "hdx.TongTien";
            break;
          case "status":
            orderByField = "gh.TinhTrangDon";
            break;
          case "paymentMethod":
            orderByField = "hdx.PhuongThucThanhToan";
            break;
          case "paymentStatus":
            orderByField = "hdx.TinhTrangThanhToan";
            break;
          default:
            orderByField = "hdx.IDHoaDonXuat";
        }
        sql += ` ORDER BY ${orderByField} ${
          sortDir === "desc" ? "DESC" : "ASC"
        }`;
      }

      if (limit) {
        sql += " LIMIT ?";
        params.push(limit);
      }

      const [rows] = await db.query(sql, params);
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async findReturnCancelRequests(body = {}, sortField = null, sortDir = "asc") {
    try {
      let sql = `
         SELECT hdx.IDHoaDonXuat, dckh.TenNguoiNhan, dckh.SoDienThoai, 
                dckh.SoNhaDuong, dckh.QuanHuyen, dckh.TinhThanhPho, 
                hdx.NgayXuat, hdx.TongTien, hdx.PhuongThucThanhToan, 
                hdx.YeuCau, gh.TinhTrangDon, hdx.TinhTrangThanhToan
         FROM hoadonxuat hdx
         JOIN giaohang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
         JOIN diachi_kh dckh ON dckh.ID_DCKH = gh.IDDiaChi
         WHERE (hdx.YeuCau = 'Trả' OR hdx.YeuCau = 'Hủy')`;

      let conditions = [];
      let params = [];

      if (body.id) {
        conditions.push("hdx.IDHoaDonXuat = ?");
        params.push(body.id);
      }

      if (body.status) {
        conditions.push("gh.TinhTrangDon = ?");
        let status = _status[body.status];
        params.push(status);
      }

      if (body.paymentMethod) {
        conditions.push("hdx.PhuongThucThanhToan = ?");
        params.push(_paymentMethod[body.paymentMethod]);
      }

      if (body.paymentStatus) {
        conditions.push("hdx.TinhTrangThanhToan = ?");
        params.push(_paymentStatus[body.paymentStatus]);
      }

      if (body.fromDate && body.toDate) {
        conditions.push("hdx.NgayXuat BETWEEN ? AND ?");
        params.push(body.fromDate, body.toDate);
      } else if (body.fromDate) {
        conditions.push("hdx.NgayXuat = ?");
        params.push(body.fromDate);
      }

      if (conditions.length > 0) {
        sql += " AND " + conditions.join(" AND ");
      }

      if (body.limit) {
        sql += " LIMIT ?";
        params.push(body.limit);
      }

      // Add ORDER BY clause if sortField is provided
      if (sortField) {
        let orderByField;
        switch (sortField) {
          case "id":
            orderByField = "hdx.IDHoaDonXuat";
            break;
          case "customer":
            orderByField = "dckh.TenNguoiNhan";
            break;
          case "date":
            orderByField = "hdx.NgayXuat";
            break;
          case "amount":
            orderByField = "hdx.TongTien";
            break;
          case "status":
            orderByField = "gh.TinhTrangDon";
            break;
          case "paymentMethod":
            orderByField = "hdx.PhuongThucThanhToan";
            break;
          case "paymentStatus":
            orderByField = "hdx.TinhTrangThanhToan";
            break;
          default:
            orderByField = "hdx.IDHoaDonXuat";
        }
        sql += ` ORDER BY ${orderByField} ${
          sortDir === "desc" ? "DESC" : "ASC"
        }`;
      }

      const [rows] = await db.query(sql, params);
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async findArchivedOrders(body = {}, sortField = null, sortDir = "asc") {
    try {
      let sql = `
         SELECT hdx.IDHoaDonXuat, dckh.TenNguoiNhan, dckh.SoDienThoai, 
                dckh.SoNhaDuong, dckh.QuanHuyen, dckh.TinhThanhPho, 
                hdx.NgayXuat, hdx.TongTien, hdx.PhuongThucThanhToan, 
                gh.TinhTrangDon, hdx.TinhTrangThanhToan, hdx.LuuTru
         FROM hoadonxuat hdx
         JOIN giaohang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
         JOIN diachi_kh dckh ON dckh.ID_DCKH = gh.IDDiaChi
         WHERE hdx.LuuTru = '1'`;

      let conditions = [];
      let params = [];

      if (body.id) {
        conditions.push("hdx.IDHoaDonXuat = ?");
        params.push(body.id);
      }

      if (body.status) {
        conditions.push("gh.TinhTrangDon = ?");
        let status = _status[body.status];
        params.push(status);
      }

      if (body.paymentMethod) {
        conditions.push("hdx.PhuongThucThanhToan = ?");
        params.push(_paymentMethod[body.paymentMethod]);
      }

      if (body.paymentStatus) {
        conditions.push("hdx.TinhTrangThanhToan = ?");
        params.push(_paymentStatus[body.paymentStatus]);
      }

      if (body.fromDate && body.toDate) {
        conditions.push("hdx.NgayXuat BETWEEN ? AND ?");
        params.push(body.fromDate, body.toDate);
      } else if (body.fromDate) {
        conditions.push("hdx.NgayXuat = ?");
        params.push(body.fromDate);
      }

      if (conditions.length > 0) {
        sql += " AND " + conditions.join(" AND ");
      }

      // Add ORDER BY clause if sortField is provided
      if (sortField) {
        let orderByField;
        switch (sortField) {
          case "id":
            orderByField = "hdx.IDHoaDonXuat";
            break;
          case "customer":
            orderByField = "dckh.TenNguoiNhan";
            break;
          case "date":
            orderByField = "hdx.NgayXuat";
            break;
          case "amount":
            orderByField = "hdx.TongTien";
            break;
          case "status":
            orderByField = "gh.TinhTrangDon";
            break;
          case "paymentMethod":
            orderByField = "hdx.PhuongThucThanhToan";
            break;
          case "paymentStatus":
            orderByField = "hdx.TinhTrangThanhToan";
            break;
          default:
            orderByField = "hdx.IDHoaDonXuat";
        }
        sql += ` ORDER BY ${orderByField} ${
          sortDir === "desc" ? "DESC" : "ASC"
        }`;
      }

      const [rows] = await db.query(sql, params);
      return rows;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  /**
   *
   * @param {number} id
   * @returns {Promise<{order: Object, items: QueryResult, summary: {subtotal: number, discount: number, shipping: number, total: number}}>}
   */
  async _findById(id) {
    try {
      const [orderInfo] = await db.query(
        `
          SELECT hdx.*, gh.TinhTrangDon, ngh.TenNhanVien AS TenNguoiGiao, gh.NgayGiaoHang, gh.GiaShip,
                 dckh.SoDienThoai, dckh.TenNguoiNhan, dckh.SoNhaDuong, dckh.QuanHuyen, dckh.TinhThanhPho,
                 nv.TenNhanVien
          FROM hoadonxuat hdx
          JOIN giaohang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
          JOIN nhanvien nv ON hdx.IDNhanVien = nv.IDNhanVien
          JOIN diachi_kh dckh ON gh.IDDiaChi = dckh.ID_DCKH
          JOIN nhanvien ngh ON gh.IDNhanVien = ngh.IDNhanVien
          WHERE hdx.IDHoaDonXuat = ?`,
        [id]
      );

      const [orderItems] = await db.query(
        `
          SELECT cthdx.*, sp.TenSanPham, sp.Gia, tg.TenTacGia, anhsp.Anh
          FROM chitiethoadonxuat cthdx 
          JOIN sanpham sp ON cthdx.IDSanPham = sp.SanPhamID 
          JOIN sp_tg ON sp.SanPhamID = sp_tg.SanPhamID 
          JOIN tacgia tg ON sp_tg.IDTacGia = tg.IDTacGia 
          JOIN anhsp ON sp.SanPhamID = anhsp.ID_SP
          WHERE cthdx.IDHoaDonXuat = ?
          AND anhsp.STT = 1;`,
        [id]
      );

      // orderInfo = orderInfo[0]
      let subtotal = 0;
      let discount = 0;
      let shipping = +orderInfo[0].GiaShip;
      console.log(shipping);
      // lấy thông tin giảm giá
      let discountInfo = null;
      if (orderInfo[0].ID_GiamGia) {
        const [discountData] = await db.query(
          `SELECT * FROM giamgia WHERE IDGiamGia = ?`,
          [orderInfo[0].ID_GiamGia]
        );
        if (Array.isArray(discountData) && discountData.length > 0) {
          discountInfo = discountData[0];
          discount = Object(discountInfo).GiaTri || 0;
        }
      }

      // tính tổng tiền
      if (Array.isArray(orderItems)) {
        orderItems.forEach((item) => {
          subtotal += item.SoLuong * item.Gia;
        });
      }

      discount = (subtotal * discount) / 100;
      const total = subtotal + shipping - discount;
      // console.log(total);
      orderInfo[0].TongTien = total;

      return {
        order: orderInfo[0],
        items: orderItems,
        summary: {
          subtotal,
          discount,
          shipping,
          total,
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  /**
   *
   * @param {number} id
   * @param {string} status
   * @param {Request | null} request
   */
  async _updateStatus(id, status, request = null) {
    try {
      const [rows] = await db.query(
        `
      UPDATE giaohang gh
      SET gh.TinhTrangDon = ?
      WHERE gh.ID_HDX = ?;`,
        [status, id]
      );

      if (request) {
        const [result] = await db.query(
          `
          UPDATE hoadonxuat hdx
          SET hdx.YeuCau = ?
          WHERE hdx.IDHoaDonXuat = ?;
          `,
          [request, id]
        );
      }
      return rows;
    } catch (err) {
      console.error(err);
    }
  }

  async _updateArchive(id, status) {
    try {
      const [rows] = await db.query(
        `
        UPDATE hoadonxuat hdx
        SET hdx.LuuTru = ?
        WHERE hdx.IDHoaDonXuat = ?;`,
        [status, id]
      );
      return rows;
    } catch (err) {
      console.error(err);
    }
  }

  async _updatePaymentStatus(id, status) {
    try {
      const [rows] = await db.query(
        `
        UPDATE hoadonxuat hdx
        SET hdx.TinhTrangThanhToan = ?
        WHERE hdx.IDHoaDonXuat = ?;`,
        [status, id]
      );
      return rows;
    } catch (err) {
      console.error(err);
    }
  }
}
