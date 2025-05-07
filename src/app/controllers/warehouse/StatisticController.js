// const statisticConfig = require('../db/statistic');
import statisticConfig from "../../model/warehouse/statistic.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
import moment from "moment";
import ExcelJS from "exceljs";

class StatisticController {
  // show statistic
  async index(req, res) {
    try {
      const statistic = await statisticConfig.getAll();
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      const total = statistic.reduce(
        (sum, r) => sum + Number(r.TongTien || 0),
        0
      );
      res.render("warehouse/statistic", {
        statistic,
        total,
        layout: "admin",
        permissions,
      });
    } catch (err) {
      console.log(err);
    }
  }

  // xem hóa đơn theo thời gian
  async history(req, res) {
    try {
      const { type, month, month_year, year } = req.query;
      let statistic = [];
      let total = 0;

      if (type === "all") {
        statistic = await statisticConfig.getAll();
      } else if (type === "month" && month && month_year) {
        // Lấy theo tháng + năm
        statistic = await statisticConfig.getReceiptsByMonthYear(
          month,
          month_year
        );
      } else if (type === "year" && year) {
        // Lấy theo năm
        statistic = await statisticConfig.getReceiptsByYear(year);
      } else {
        // Nếu không có lọc, lấy toàn bộ
        statistic = await statisticConfig.getAll();
      }

      // Tính tổng tiền
      total = statistic.reduce((sum, r) => sum + Number(r.TongTien || 0), 0);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      res.render("warehouse/statistic", {
        statistic,
        total,
        type: type || "all",
        month,
        month_year,
        year,
        layout: "admin",
        permissions,
      });
    } catch (err) {
      console.log(err);
    }
  }

  // xuất file excel
  async create_excel(req, res) {
    try {
      const { type, month, month_year, year } = req.query;
      let data = [];

      if (type === "month" && month && month_year) {
        data = await statisticConfig.getReceiptsByMonthYear(month, month_year);
      } else if (type === "year" && year) {
        data = await statisticConfig.getReceiptsByYear(year);
      } else if (type === "all") {
        data = await statisticConfig.getAll(); // <-- Thêm dòng này để lấy tất cả nếu không có ngày
      }
      const total = data.reduce((sum, r) => sum + Number(r.TongTien || 0), 0);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách hóa đơn");

      // Định nghĩa các cột
      worksheet.columns = [
        { header: "Mã Hóa Đơn", key: "IDHoaDonNhap", width: 15 },
        { header: "Nhà Cung Cấp", key: "TenNCC", width: 25 },
        { header: "Nhân Viên", key: "TenNhanVien", width: 25 },
        { header: "Ngày Nhập", key: "NgayNhap", width: 20 },
        // { header: 'Tình Trạng Thanh Toán', key: 'TinhTrangThanhToan', width: 25 },
        { header: "Tổng Tiền", key: "TongTien", width: 20 },
      ];

      // Thêm dữ liệu
      data.forEach((item) => {
        worksheet.addRow({
          ...item,
          NgayNhap: new Date(item.NgayNhap),
        });
      });

      // Format ngày và tiền
      worksheet.getColumn("NgayNhap").eachCell((cell, rowNumber) => {
        if (rowNumber > 1 && cell.value instanceof Date) {
          cell.value = moment(cell.value).format("DD/MM/YYYY HH:mm");
        }
      });

      worksheet.getColumn("TongTien").eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          const value = Number(cell.value);
          cell.value = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value);
        }
      });

      // Thêm dòng "Tổng cộng"
      const lastRow = worksheet.addRow({
        IDHoaDonNhap: "Tổng cộng",
      });

      // Gộp các ô từ cột A đến E cho dòng này
      const mergeRange = `A${lastRow.number}:D${lastRow.number}`;
      worksheet.mergeCells(mergeRange);

      const mergedCell = worksheet.getCell(`A${lastRow.number}`);
      mergedCell.alignment = { horizontal: "right", vertical: "middle" };
      mergedCell.font = { bold: true };

      // Đặt giá trị và format tiền cho ô tổng tiền ở cột F
      const tongTienCell = worksheet.getCell(`E${lastRow.number}`);
      tongTienCell.value = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(total);
      tongTienCell.font = { bold: true };
      tongTienCell.alignment = { horizontal: "right", vertical: "middle" };

      // Xuất file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=ds_hoadon.xlsx"
      );
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log(error);
    }
  }
}

// module.exports = new StatisticController();
export default new StatisticController();
