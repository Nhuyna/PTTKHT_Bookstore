// @ts-nocheck
import Statistic from "../../model/sales/Statistic.js";
import { generateRevenueExcel } from "../../services/excelService.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
class StatisticController {
  constructor() {
    this.statisticModel = new Statistic();
  }

  // Render trang thống kê
  show = async (req, res) => {
    try {
      const {
        type = "day",
        startDate,
        endDate,
        month,
        year,
        startYear,
        endYear,
      } = req.query;

      const today = new Date();
      const currentMonth = month ? parseInt(month) : today.getMonth() + 1;
      const currentYear = year ? parseInt(year) : today.getFullYear();

      let data = [];
      // let title = "";

      // Lấy dữ liệu theo loại thống kê
      switch (type) {
        case "custom":
          // Nếu có startDate và endDate, thống kê theo khoảng thời gian
          if (startDate && endDate) {
            data = await this.statisticModel.getRevenueByDate(
              startDate,
              endDate
            );
            // title = `Thống kê doanh thu từ ${startDate} đến ${endDate}`;
          }
          break;
        case "month": {
          // Thống kê theo tháng trong năm
          const selectedYear = year || currentYear;
          data = await this.statisticModel.getRevenueByMonth(selectedYear);
          // title = `Thống kê doanh thu theo tháng năm ${selectedYear}`;
          break;
        }
        case "year": {
          // Thống kê theo năm
          const fromYear = startYear || currentYear - 5;
          const toYear = endYear || currentYear;
          data = await this.statisticModel.getRevenueByYear(fromYear, toYear);
          // title = `Thống kê doanh thu từ năm ${fromYear} đến năm ${toYear}`;
          break;
        }
        case "day":
        default:
          // Mặc định thống kê theo ngày trong tháng
          data = await this.statisticModel.getDailyRevenueInMonth(
            currentMonth,
            currentYear
          );
          // title = `Thống kê doanh thu tháng ${currentMonth}/${currentYear}`;
          break;
      }

      // Format dữ liệu để hiển thị trên frontend
      const formattedData = this.formatRevenueData(data);

      // Tính tổng
      const totals = this.calculateTotals(data);

      // Chuẩn bị dữ liệu năm cho selects
      const years = [];
      for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
      }

      // Chuẩn bị dữ liệu tháng cho select
      const months = [];
      for (let i = 1; i <= 12; i++) {
        months.push({
          value: i,
          text: `Tháng ${i}/${currentYear}`,
        });
      }

      // Thiết lập ngày mặc định cho date pickers
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);

      const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      console.log(permissions);

      res.render("sales/statistic", {
        title: "Thống Kê Doanh Thu",
        data: formattedData,
        totals,
        activeTab: type,
        currentMonth,
        currentYear,
        years,
        months,
        defaultStartDate: formatDateForInput(oneMonthAgo),
        defaultEndDate: formatDateForInput(today),
        startYear: startYear || years[0],
        endYear: endYear || years[0],
        selectedYear: year || years[0],
        layout: "sales",
        currentPath: req.path,
        permissions,
      });
    } catch (error) {
      console.error("Error in StatisticController.show:", error);
      res.status(500).send("Server error");
    }
  };

  // API xuất dữ liệu thống kê ra Excel
  exportToExcel = async (req, res) => {
    try {
      const { type, startDate, endDate, year, month, startYear, endYear } =
        req.query;

      let data = [];
      // let title = "Thống kê doanh thu";

      // Lấy dữ liệu tương ứng với loại thống kê
      if (type === "custom" && startDate && endDate) {
        data = await this.statisticModel.getRevenueByDate(startDate, endDate);
      } else if (type === "month" && year) {
        data = await this.statisticModel.getRevenueByMonth(year);
      } else if (type === "year" && startYear && endYear) {
        data = await this.statisticModel.getRevenueByYear(startYear, endYear);
      } else if (type === "day" && month && year) {
        data = await this.statisticModel.getDailyRevenueInMonth(month, year);
        ``;
      } else {
        return res.status(400).send("Tham số không hợp lệ");
      }

      // Xuất Excel
      const result = await generateRevenueExcel(data, type);

      if (result.success) {
        // Trả về file Excel để download trực tiếp
        const filePath = `${process.cwd()}/src/public/exports/${
          result.fileName
        }`;
        return res.download(filePath, result.fileName);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      return res.status(500).send(`Lỗi khi xuất Excel: ${error.message}`);
    }
  };

  // Hàm format dữ liệu thống kê
  formatRevenueData(data) {
    return data.map((item) => {
      let dateDisplay;
      if (item.Ngay) {
        // Format ngày DD/MM/YYYY
        const date = new Date(item.Ngay);
        dateDisplay = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
      } else if (item.Thang) {
        dateDisplay = `Tháng ${item.Thang}`;
      } else if (item.Nam) {
        dateDisplay = `Năm ${item.Nam}`;
      }

      return {
        Ngay: dateDisplay,
        DoanhThu: this.formatCurrency(item.DoanhThu),
        Von: this.formatCurrency(item.Von),
        LoiNhuan: this.formatCurrency(item.LoiNhuan),
        raw: {
          DoanhThu: item.DoanhThu,
          Von: item.Von,
          LoiNhuan: item.LoiNhuan,
        },
      };
    });
  }

  // Hàm tính tổng
  calculateTotals(data) {
    const totals = data.reduce(
      (acc, item) => {
        acc.DoanhThu += parseFloat(item.DoanhThu || 0);
        acc.Von += parseFloat(item.Von || 0);
        acc.LoiNhuan += parseFloat(item.LoiNhuan || 0);
        return acc;
      },
      { DoanhThu: 0, Von: 0, LoiNhuan: 0 }
    );

    return {
      DoanhThu: this.formatCurrency(totals.DoanhThu),
      Von: this.formatCurrency(totals.Von),
      LoiNhuan: this.formatCurrency(totals.LoiNhuan),
      raw: totals,
    };
  }

  // Format số tiền thành dạng VNĐ
  formatCurrency(amount) {
    return (
      new Intl.NumberFormat("vi-VN", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(amount) + " đ"
    );
  }
}

export default new StatisticController();
