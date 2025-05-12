import db from "../../../config/db.js";

class DashboardModel {
  // Lấy thống kê tổng quan
  async getDashboardStats(period = "month") {
    try {
      // Lấy doanh thu, vốn, lợi nhuận, số sản phẩm đã bán và số khách hàng mới
      const sql = `
        SELECT 
          SUM(cthdx.ThanhTien) AS DoanhThu,
          SUM(cthdx.SoLuong * 
            (SELECT AVG(cthdn_sub.GiaNhap) 
            FROM chitiethoadonnhap cthdn_sub 
            WHERE cthdn_sub.IDSanPham = cthdx.IDSanPham)
          ) AS Von,
          SUM(cthdx.ThanhTien - 
            (cthdx.SoLuong * 
              (SELECT AVG(cthdn_sub.GiaNhap) 
              FROM chitiethoadonnhap cthdn_sub 
              WHERE cthdn_sub.IDSanPham = cthdx.IDSanPham)
            )
          ) AS LoiNhuan,
          SUM(cthdx.SoLuong) AS SoSanPhamBan,
          COUNT(DISTINCT hdx.ID_KH) AS SoKhachHang
        FROM chitiethoadonxuat cthdx
        INNER JOIN hoadonxuat hdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
        INNER JOIN giaohang gh ON gh.ID_HDX = hdx.IDHoaDonXuat
        WHERE gh.TinhTrangDon = 'Đã giao'
        AND gh.NgayGiaoHang BETWEEN DATE_FORMAT('2025-04-30', '%Y-%m-01') AND '2025-04-30'
      `;

      const [currentStats] = await db.query(sql);

      // Lấy dữ liệu của tháng trước để so sánh
      const previousSql = `
        SELECT 
          SUM(cthdx.ThanhTien) AS DoanhThu,
          SUM(cthdx.SoLuong * 
            (SELECT AVG(cthdn_sub.GiaNhap) 
            FROM chitiethoadonnhap cthdn_sub 
            WHERE cthdn_sub.IDSanPham = cthdx.IDSanPham)
          ) AS Von,
          SUM(cthdx.ThanhTien - 
            (cthdx.SoLuong * 
              (SELECT AVG(cthdn_sub.GiaNhap) 
              FROM chitiethoadonnhap cthdn_sub 
              WHERE cthdn_sub.IDSanPham = cthdx.IDSanPham)
            )
          ) AS LoiNhuan,
          SUM(cthdx.SoLuong) AS SoSanPhamBan,
          COUNT(DISTINCT hdx.ID_KH) AS SoKhachHang
        FROM chitiethoadonxuat cthdx
        INNER JOIN hoadonxuat hdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
        INNER JOIN giaohang gh ON gh.ID_HDX = hdx.IDHoaDonXuat
        WHERE gh.TinhTrangDon = 'Đã giao'
        AND gh.NgayGiaoHang BETWEEN DATE_FORMAT(DATE_SUB('2025-04-30', INTERVAL 1 MONTH), '%Y-%m-01') 
        AND LAST_DAY(DATE_SUB('2025-04-30', INTERVAL 1 MONTH))
      `;

      const [previousStats] = await db.query(previousSql);

      // Tính toán phần trăm thay đổi
      const calculatePercentChange = (current, previous) => {
        if (!previous || previous === 0) return 100;
        return ((current - previous) / previous) * 100;
      };

      const result = {
        current: currentStats[0] || {
          DoanhThu: 0,
          Von: 0,
          LoiNhuan: 0,
          SoSanPhamBan: 0,
          SoKhachHang: 0,
        },
        previous: previousStats[0] || {
          DoanhThu: 0,
          Von: 0,
          LoiNhuan: 0,
          SoSanPhamBan: 0,
          SoKhachHang: 0,
        },
        percentChange: {
          DoanhThu: calculatePercentChange(
            currentStats[0]?.DoanhThu || 0,
            previousStats[0]?.DoanhThu || 0
          ),
          Von: calculatePercentChange(
            currentStats[0]?.Von || 0,
            previousStats[0]?.Von || 0
          ),
          LoiNhuan: calculatePercentChange(
            currentStats[0]?.LoiNhuan || 0,
            previousStats[0]?.LoiNhuan || 0
          ),
          SoSanPhamBan: calculatePercentChange(
            currentStats[0]?.SoSanPhamBan || 0,
            previousStats[0]?.SoSanPhamBan || 0
          ),
          SoKhachHang: calculatePercentChange(
            currentStats[0]?.SoKhachHang || 0,
            previousStats[0]?.SoKhachHang || 0
          ),
        },
      };

      return result;
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      throw error;
    }
  }

  // Lấy danh sách nhà cung cấp gần đây

  async getRecentProviders(limit = 8) {
    try {
      const sql = `
        SELECT 
          NCC.ID_NCC, 
          NCC.TenNCC, 
          NCC.SDT,
          NCC.TinhTrang
        FROM HoaDonNhap
        LEFT JOIN NCC ON HoaDonNhap.ID_NCC = NCC.ID_NCC
        ORDER BY ABS(DATEDIFF(NgayNhap, CURDATE()))
        LIMIT ?
      `;

      const [providers] = await db.query(sql, [limit]);
      return providers;
    } catch (error) {
      console.error("Error fetching recent providers:", error);
      throw error;
    }
  }
  // Lấy đơn hàng gần đây
  async getRecentOrders(limit = 5) {
    try {
      const sql = `
        SELECT 
          hdx.IDHoaDonXuat, 
          kh.TenKH,
          hdx.NgayXuat, 
          hdx.TongTien, 
          gh.TinhTrangDon,
          hdx.TinhTrangThanhToan
        FROM hoadonxuat hdx
        INNER JOIN khachhang kh ON kh.ID_KH = hdx.ID_KH
        INNER JOIN giaohang gh ON gh.ID_HDX = hdx.IDHoaDonXuat
        ORDER BY ABS(DATEDIFF(NgayXuat, CURDATE()))
        LIMIT ?
      `;

      const [orders] = await db.query(sql, [limit]);
      return orders;
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      throw error;
    }
  }
  // Lấy hóa đơn nhập gần đây
  async getRecentReceipts(limit = 5) {
    try {
      const sql = `
        SELECT 
          hdn.IDHoaDonNhap, 
          hdn.NgayNhap,
          ncc.TenNCC,
          nv.TenNhanVien,
          hdn.TongTien
        FROM hoadonnhap hdn
        INNER JOIN ncc ON ncc.ID_NCC = hdn.ID_NCC
        INNER JOIN nhanvien nv ON nv.IDNhanVien = hdn.IDNhanVien
        ORDER BY ABS(DATEDIFF(NgayNhap, CURDATE()))
        LIMIT ?
      `;

      const [receipts] = await db.query(sql, [limit]);
      return receipts;
    } catch (error) {
      console.error("Error fetching recent receipts:", error);
      throw error;
    }
  }
  // Lấy thống kê phân bố danh mục sản phẩm
  async getProductCategories() {
    try {
      const sql = `
        SELECT 
          dm.TenDanhMuc,
          COUNT(sp.SanPhamID) AS SoLuong,
          ROUND(COUNT(sp.SanPhamID) * 100.0 / (
            SELECT COUNT(*) FROM sanpham WHERE TinhTrang = 1
          ), 2) AS PhanTram
        FROM sanpham sp
        INNER JOIN sp_dm ON sp_dm.SanPhamID = sp.SanPhamID
        INNER JOIN danhmuc dm ON dm.DanhMucID = sp_dm.DanhMucID
        WHERE sp.TinhTrang = 1
        GROUP BY dm.DanhMucID, dm.TenDanhMuc
        ORDER BY SoLuong DESC
      `;

      const [categories] = await db.query(sql);
      return categories;
    } catch (error) {
      console.error("Error fetching product categories:", error);
      throw error;
    }
  }
}

export default new DashboardModel();
