import { BaseModel } from "./BaseModel.js";

export default class Statistic extends BaseModel {
  constructor() {
    super("HoaDonXuat", "IDHoaDonXuat");
  }
  async getRevenueByDate(startDate, endDate) {
    try {
      const query = `
        SELECT 
        DATE(gh.NgayGiaoHang) as Ngay,
        SUM(cthdx.SoLuong * sp.Gia) as DoanhThu,
        SUM(cthdx.SoLuong * (
            SELECT cthdn.GiaNhap
            FROM chitiethoadonnhap cthdn
            JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
            WHERE cthdn.IDSanPham = cthdx.IDSanPham
            ORDER BY hdn.NgayNhap DESC
            LIMIT 1
        )) as Von,
        SUM(cthdx.SoLuong * sp.Gia) - SUM(cthdx.SoLuong * (
            SELECT cthdn.GiaNhap
            FROM chitiethoadonnhap cthdn
            JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
            WHERE cthdn.IDSanPham = cthdx.IDSanPham
            ORDER BY hdn.NgayNhap DESC
            LIMIT 1
        )) as LoiNhuan
        FROM HoaDonXuat hdx
        JOIN ChiTietHoaDonXuat cthdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
        JOIN SanPham sp ON cthdx.IDSanPham = sp.SanPhamID
        JOIN GiaoHang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
        WHERE DATE(gh.NgayGiaoHang) BETWEEN ? AND ?
                AND gh.TinhTrangDon = "Đã giao"
                GROUP BY DATE(gh.NgayGiaoHang)
                ORDER BY DATE(gh.NgayGiaoHang) ASC
      `;

      return await this.query(query, [startDate, endDate]);
    } catch (err) {
      console.error("Error in getRevenueByDate:", err);
      throw new Error(err);
    }
  }

  async getRevenueByMonth(year) {
    try {
      const query = `
        SELECT 
            MONTH(gh.NgayGiaoHang) as Thang,
            SUM(cthdx.SoLuong * sp.Gia) as DoanhThu,
            SUM(cthdx.SoLuong * (
                SELECT cthdn.GiaNhap
                FROM chitiethoadonnhap cthdn
                JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
                WHERE cthdn.IDSanPham = cthdx.IDSanPham
                ORDER BY hdn.NgayNhap DESC
                LIMIT 1
            )) as Von,
            SUM(cthdx.SoLuong * sp.Gia) - SUM(cthdx.SoLuong * (
                SELECT cthdn.GiaNhap
                FROM chitiethoadonnhap cthdn
                JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
                WHERE cthdn.IDSanPham = cthdx.IDSanPham
                ORDER BY hdn.NgayNhap DESC
                LIMIT 1
            )) as LoiNhuan
        FROM HoaDonXuat hdx
        JOIN ChiTietHoaDonXuat cthdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
        JOIN SanPham sp ON cthdx.IDSanPham = sp.SanPhamID
        JOIN GiaoHang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
        WHERE YEAR(gh.NgayGiaoHang) = ?
                AND gh.TinhTrangDon = "Đã giao"
                GROUP BY MONTH(gh.NgayGiaoHang)
                ORDER BY MONTH(gh.NgayGiaoHang) ASC
      `;

      return await this.query(query, [year]);
    } catch (err) {
      console.error("Error in getRevenueByMonth:", err);
      throw new Error(err);
    }
  }

  async getRevenueByYear(startYear, endYear) {
    try {
      const query = `
        SELECT YEAR(gh.NgayGiaoHang) as Nam,
               SUM(cthdx.SoLuong * sp.Gia) as DoanhThu,
               SUM(cthdx.SoLuong * (
                   SELECT cthdn.GiaNhap
                   FROM chitiethoadonnhap cthdn
                   JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
                   WHERE cthdn.IDSanPham = cthdx.IDSanPham
                   ORDER BY hdn.NgayNhap DESC
                   LIMIT 1
               )) as Von,
               SUM(cthdx.SoLuong * sp.Gia) - SUM(cthdx.SoLuong * (
                   SELECT cthdn.GiaNhap
                   FROM chitiethoadonnhap cthdn
                   JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
                   WHERE cthdn.IDSanPham = cthdx.IDSanPham
                   ORDER BY hdn.NgayNhap DESC
                   LIMIT 1
               )) as LoiNhuan
        FROM HoaDonXuat hdx
        JOIN ChiTietHoaDonXuat cthdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat
        JOIN SanPham sp ON cthdx.IDSanPham = sp.SanPhamID
        JOIN GiaoHang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
        WHERE YEAR(gh.NgayGiaoHang) BETWEEN ? AND ?
        AND gh.TinhTrangDon = "Đã giao"
        GROUP BY YEAR(gh.NgayGiaoHang)
        ORDER BY YEAR(gh.NgayGiaoHang) ASC
      `;

      return await this.query(query, [startYear, endYear]);
    } catch (err) {
      console.error("Error in getRevenueByYear:", err);
      throw new Error(err);
    }
  }

  async getDailyRevenueInMonth(month, year) {
    try {
      const query = `
        SELECT 
            DATE(gh.NgayGiaoHang) as Ngay,
            SUM(cthdx.SoLuong * sp.Gia) as DoanhThu,
            SUM(cthdx.SoLuong * (
                SELECT cthdn.GiaNhap
                FROM chitiethoadonnhap cthdn
                JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
                WHERE cthdn.IDSanPham = cthdx.IDSanPham
                ORDER BY hdn.NgayNhap DESC
                LIMIT 1
            )) as Von,
            SUM(cthdx.SoLuong * sp.Gia) - SUM(cthdx.SoLuong * (
                SELECT cthdn.GiaNhap
                FROM chitiethoadonnhap cthdn
                JOIN hoadonnhap hdn ON cthdn.IDHoaDonNhap = hdn.IDHoaDonNhap
                WHERE cthdn.IDSanPham = cthdx.IDSanPham
                ORDER BY hdn.NgayNhap DESC
                LIMIT 1
            )) as LoiNhuan
        FROM HoaDonXuat hdx
        JOIN ChiTietHoaDonXuat cthdx ON hdx.IDHoaDonXuat = cthdx.IDHoaDonXuat        
        JOIN SanPham sp ON cthdx.IDSanPham = sp.SanPhamID
        JOIN GiaoHang gh ON hdx.IDHoaDonXuat = gh.ID_HDX
        WHERE MONTH(gh.NgayGiaoHang) = ? AND YEAR(gh.NgayGiaoHang) = ?
                AND gh.TinhTrangDon = "Đã giao"
                GROUP BY DATE(gh.NgayGiaoHang)
                ORDER BY DATE(gh.NgayGiaoHang) ASC
      `;

      return await this.query(query, [month, year]);
    } catch (err) {
      console.error("Error in getDailyRevenueInMonth:", err);
      throw new Error(err);
    }
  }
}
