// const receiptConfig = require('../db/receipt');
import receiptConfig from "../../model/warehouse/receipt.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import ExcelJS from "exceljs";
import moment from "moment";

// Xử lý __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeString(str) {
  return str
    .normalize("NFD") // Chuyển ký tự có dấu thành dạng tổ hợp (VD: é → e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .toLowerCase() // Chuyển về chữ thường
    .trim(); // Xóa khoảng trắng đầu & cuối
}

class ReceiptController {
  // show all receipts
  async index(req, res) {
    try {
      const receipt = await receiptConfig.getAll();
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlhdn");

      res.render("warehouse/receipt", {
        receipt,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // search receipt
  async search(req, res) {
    try {
      const { id } = req.params;
      const receipt = await receiptConfig.search(id);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlhdn");
      console.log(action);
      res.render("warehouse/receipt", {
        receipt,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // view receipt details
  async view(req, res) {
    try {
      const { id } = req.params;
      const receipt_info = (await receiptConfig.view(id))[0];
      const product_detail = await receiptConfig.view_product_in_receipt(id);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlhdn");
      console.log(action);

      res.render("warehouse/view_receipt", {
        id,
        receipt_info,
        product_detail,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // create new receipt form
  async create(req, res) {
    try {
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlhdn");
      console.log(action);
      res.render("warehouse/create_receipt", {
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // select provider (create form)
  async search_provider(req, res) {
    try {
      const query = req.query.q?.toLowerCase() || "";
      let products = await receiptConfig.get_provider();
      const result = products.filter((product) =>
        normalizeString(product.provider_info).toLowerCase().includes(query)
      );
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }

  // select employee (create form)
  async search_employee(req, res) {
    try {
      const query = req.query.q?.toLowerCase() || "";
      let employees = await receiptConfig.get_employee();
      const result = employees.filter((employee) =>
        normalizeString(employee.employee_info).toLowerCase().includes(query)
      );
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }

  // select employee (create form)
  async search_product(req, res) {
    try {
      const query = req.query.q?.toLowerCase() || "";
      let products = await receiptConfig.get_product();
      const result = products.filter((product) =>
        normalizeString(product.product_info).toLowerCase().includes(query)
      );
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }

  // get data from create form and create new receipt
  async store(req, res) {
    try {
      const { provider, employee, product_details } = req.body;
      const [provider_id, provider_name] = provider.split(" - ");
      const [employee_id, employee_name] = employee.split(" - ");
      const product = JSON.parse(product_details);
      await receiptConfig.insert(provider_id, employee_id, product);
      res.redirect("/admin/warehouse/receipt");
    } catch (error) {
      console.log(error);
    }
  }

  // update data form
  async update(req, res) {
    try {
      const { id } = req.params;
      const receipt_info = (await receiptConfig.get_receipt(id))[0];
      const receipt_detail = await receiptConfig.get_receipt_detail(id);
      const product_detail = JSON.stringify(receipt_detail);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlhdn");
      console.log(action);
      res.render("warehouse/update_receipt", {
        receipt_info,
        receipt_detail,
        product_detail,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // get data from update and edit receipt
  async edit(req, res) {
    try {
      const { id, provider, employee, product_details } = req.body;
      const [provider_id, provider_name] = provider.split(" - ");
      const [employee_id, employee_name] = employee.split(" - ");
      const product = JSON.parse(product_details);
      await receiptConfig.update(id, provider_id, employee_id, product);
      res.redirect("/admin/warehouse/receipt");
    } catch (error) {
      console.log(error);
    }
  }

  // create pdf receipt
  async create_pdf(req, res) {
    try {
      const hbsInstance = req.app.locals.hbsInstance; // lấy hbsInstance từ index.js
      const { id } = req.params;
      const receipt_info = (await receiptConfig.view(id))[0];
      const product_detail = await receiptConfig.view_product_in_receipt(id);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlhdn");
      console.log(action);
      const html = await hbsInstance.render(
        path.join(
          __dirname,
          "../../../resources/views/warehouse/create_receipt_pdf.hbs"
        ),
        {
          id,
          receipt_info,
          product_detail,
          layout: "warehouse",
          permissions,
          action,
        }
      );
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({ format: "A4" });
      await browser.close();

      // Gửi về client với header rõ ràng
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=receipt.pdf",
        "Content-Length": pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      console.log(error);
    }
  }

  // create excel receipt
  async create_excel(req, res) {
    try {
      const data = await receiptConfig.getAll(); // Lấy dữ liệu từ DB
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
      data.forEach((item, index) => {
        worksheet.addRow({
          ...item,
          NgayNhap: new Date(item.NgayNhap),
        });
      });

      // Format ngày và tiền
      worksheet.getColumn("NgayNhap").eachCell((cell, rowNumber) => {
        if (rowNumber > 1 && cell.value instanceof Date) {
          cell.value = moment(cell.value).format("DD/MM/YY HH:mm");
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

// module.exports = new ReceiptController();
export default new ReceiptController();
