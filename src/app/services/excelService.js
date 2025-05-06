import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generateOrdersExcel(orders, res = null) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
      { header: "Mã đơn hàng", key: "IDHoaDonXuat", width: 20 },
      { header: "Tên khách hàng", key: "TenNguoiNhan", width: 30 },
      { header: "Số điện thoại", key: "SoDienThoai", width: 20 },
      { header: "Địa chỉ", key: "DiaChi", width: 75 },
      { header: "Ngày đặt hàng", key: "NgayXuat", width: 20 },
      { header: "Tổng tiền", key: "TongTien", width: 20 },
      { header: "Trạng thái đơn hàng", key: "TrangThaiDonHang", width: 20 },
      {
        header: "Phương thức thanh toán",
        key: "PhuongThucThanhToan",
        width: 20,
      },
      { header: "Tình trang thanh toán", key: "TinhTrangThanhToan", width: 20 },
    ];

    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };

    orders.forEach((order) => {
      worksheet.addRow({
        IDHoaDonXuat: order.IDHoaDonXuat,
        TenNguoiNhan: order.TenNguoiNhan,
        SoDienThoai: order.SoDienThoai,
        DiaChi: `${order.SoNhaDuong}, ${order.QuanHuyen}, ${order.TinhThanhPho}`,
        NgayXuat: order.NgayXuat,
        TongTien: order.TongTien,
        TrangThaiDonHang: order.TrangThaiDonHang,
        PhuongThucThanhToan: order.PhuongThucThanhToan,
        TinhTrangThanhToan: order.TinhTrangThanhToan,
      });
    });

    worksheet.getColumn("NgayXuat").numFmt = "dd/mm/yyyy";
    worksheet.getColumn("TongTien").numFmt = "#,##0 ₫";

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `orders_${timestamp}.xlsx`;

    // Nếu có response, gửi Excel trực tiếp đến response
    if (res) {
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    }

    // Nếu không có response, lưu file vào thư mục exports (hành vi cũ)
    const exportsDir = path.join(__dirname, "../..", "public", "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const filePath = path.join(exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    return {
      success: true,
      fileName,
      filePath,
    };
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function generateRevenueExcel(data, title, type) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Revenue Statistics");

    worksheet.mergeCells("A1:D1");
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = title;
    titleRow.getCell(1).font = { bold: true, size: 16 };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    titleRow.height = 30;

    worksheet.mergeCells("A2:D2");
    const dateRow = worksheet.getRow(2);
    dateRow.getCell(
      1
    ).value = `Ngày xuất báo cáo: ${new Date().toLocaleDateString("vi-VN")}`;
    dateRow.getCell(1).alignment = { horizontal: "center" };
    dateRow.height = 20;

    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      "Thời gian",
      "Doanh thu",
      "Vốn",
      "Lợi nhuận",
    ]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    let timeLabel = "";
    switch (type) {
      case "day":
        timeLabel = "Ngày";
        break;
      case "month":
        timeLabel = "Tháng";
        break;
      case "year":
        timeLabel = "Năm";
        break;
      default:
        timeLabel = "Ngày";
    }

    data.forEach((item) => {
      let timeValue;

      if (item.Ngay) {
        const date = new Date(item.Ngay);
        timeValue = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
      } else if (item.Thang) {
        timeValue = `Tháng ${item.Thang}`;
      } else if (item.Nam) {
        timeValue = `Năm ${item.Nam}`;
      }

      worksheet.addRow([timeValue, item.DoanhThu, item.Von, item.LoiNhuan]);
    });

    const totals = data.reduce(
      (acc, item) => {
        acc.DoanhThu += parseFloat(item.DoanhThu || 0);
        acc.Von += parseFloat(item.Von || 0);
        acc.LoiNhuan += parseFloat(item.LoiNhuan || 0);
        return acc;
      },
      { DoanhThu: 0, Von: 0, LoiNhuan: 0 }
    );

    const totalRow = worksheet.addRow([
      "Tổng",
      totals.DoanhThu,
      totals.Von,
      totals.LoiNhuan,
    ]);
    totalRow.font = { bold: true };
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    worksheet.getColumn(2).numFmt = "#,##0 ₫";
    worksheet.getColumn(3).numFmt = "#,##0 ₫";
    worksheet.getColumn(4).numFmt = "#,##0 ₫";

    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `revenue_stats_${timestamp}.xlsx`;

    const exportsDir = path.join(__dirname, "..", "public", "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const filePath = path.join(exportsDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return {
      success: true,
      fileName,
      filePath,
    };
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
