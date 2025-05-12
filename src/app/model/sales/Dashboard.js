import db from "../../../config/db.js";
import { BaseModel } from "./BaseModel.js";

class Dashboard extends BaseModel {
  constructor() {
    super("SanPham", "SanPhamID");
  }

  async getTopProductsByCurrentMonth(limit = 5) {
    try {
      const sql = `
            SELECT 
              sp.SanPhamID, 
              sp.TenSanPham, 
              dm.TenDanhMuc AS DanhMuc,
              sp.Gia AS GiaBan, 
              SUM(cthdx.SoLuong) AS SoLuongBan,
              SUM(cthdx.ThanhTien) AS DoanhThu
            FROM chitiethoadonxuat cthdx
            INNER JOIN hoadonxuat hdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
            INNER JOIN giaohang gh ON gh.ID_HDX = hdx.IDHoaDonXuat
            INNER JOIN sanpham sp ON sp.SanPhamID = cthdx.IDSanPham
            INNER JOIN sp_dm ON sp_dm.SanPhamID = sp.SanPhamID
            INNER JOIN danhmuc dm ON dm.DanhMucID = sp_dm.DanhMucID
            WHERE gh.TinhTrangDon = 'Đã giao'
            AND gh.NgayGiaoHang BETWEEN DATE_FORMAT('2025-04-30', '%Y-%m-01') AND '2025-04-30'
            GROUP BY sp.SanPhamID, sp.TenSanPham, dm.TenDanhMuc, sp.Gia
            ORDER BY SoLuongBan DESC
            LIMIT ?
          `;

      const [topProducts] = await db.query(sql, [limit]);
      return topProducts;
    } catch (error) {
      console.error("Error fetching top selling products:", error);
      throw error;
    }
  }

  async getDashboard() {
    try {
      let sql = `SELECT SUM(cthdx.SoLuong) as DaBan, SUM(cthdx.ThanhTien) AS TongTien, COUNT(DISTINCT hdx.IDHoaDonXuat) AS SoHDX, 
                        COUNT(DISTINCT hdx.ID_KH) AS SoKH
                 FROM chitiethoadonxuat cthdx
                 INNER JOIN hoadonxuat hdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
                 INNER JOIN giaohang gh ON gh.ID_HDX = hdx.IDHoaDonXuat
                 WHERE gh.TinhTrangDon = 'Đã giao'
              `;
      const [dashboard] = await db.query(sql);

      return dashboard;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }

  async getRevenueCurrentMonth() {
    try {
      const sql = `SELECT 
                        DATE(gh.NgayGiaoHang) AS Ngay,
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
                        ) AS LoiNhuan
                    FROM chitiethoadonxuat cthdx
                    INNER JOIN hoadonxuat hdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
                    INNER JOIN giaohang gh ON gh.ID_HDX = hdx.IDHoaDonXuat
                    INNER JOIN sanpham sp ON sp.SanPhamID = cthdx.IDSanPham
                    WHERE gh.TinhTrangDon = 'Đã giao'
                    AND gh.NgayGiaoHang BETWEEN DATE_FORMAT('2025-04-30', '%Y-%m-01') AND '2025-04-30'
                    GROUP BY DATE(gh.NgayGiaoHang)
                    ORDER BY DATE(gh.NgayGiaoHang)`;

      const [revenueData] = await db.query(sql);
      return revenueData;
    } catch (error) {
      console.error("Error fetching current month revenue data:", error);
      throw error;
    }
  }
}

export default Dashboard;
