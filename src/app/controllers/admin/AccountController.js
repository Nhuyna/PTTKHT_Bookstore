// const accountConfig = require('../db/account');
import accountConfig from '../../model/admin/account.js';
import phanquyen from "../../model/admin/phanquyenModel.js";
import ExcelJS from 'exceljs';
import moment from 'moment';

function normalizeString(str) {
  return str
    .normalize("NFD") // Chuyển ký tự có dấu thành dạng tổ hợp (VD: é → e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .toLowerCase() // Chuyển về chữ thường
    .trim(); // Xóa khoảng trắng đầu & cuối
}

class AccountController{
  // show all account
  async index (req, res){
      try {
          let permissions = (
              await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
          ).map((p) => p.ChucNang);
      
          // Thêm quyền "all" vào danh sách permissions
          const allPermissions = (
              await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
          ).map((p) => p.ChucNang);
      
          permissions = permissions.concat(allPermissions);
          permissions.push("admin");
          let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
          console.log(action)
          const account = await accountConfig.getAll();
          res.render('admin/account', {
              account,
              layout: "admin",
              permissions,
              action,
          });
      } catch (err) {
          console.log(err);
      }
  }

  // search account
  async search(req, res) {
    try {
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      permissions.push("admin");
      let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
      const { id } = req.params;
      res.render("admin/account", { layout: "admin", permissions, action });
    } catch (err) {
      console.log(err);
    }
  }

  // view detail account
  async view(req, res) {
    try {
      const { id } = req.params;
      const account = (await accountConfig.search(id))[0];
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      permissions.push("admin");
      let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
      res.render("admin/view_account", {
        account,
        layout: "admin",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // select employee (create form)
  async search_employee(req, res) {
    try {
      const query = req.query.q?.toLowerCase() || "";
      let employees = await accountConfig.get_employee();
      const result = employees.filter((employee) =>
        normalizeString(employee.employee_info).toLowerCase().includes(query)
      );
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }

  // select permission (create form)
  async search_permission(req, res) {
    try {
      const query = req.query.q?.toLowerCase() || "";
      let permissions = await accountConfig.get_permission();
      const result = permissions.filter((permission) =>
        normalizeString(permission.permission_info).toLowerCase().includes(query)
      );
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }

  // create form
  async create(req, res){
      try {
        let permissions = (
            await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
        ).map((p) => p.ChucNang);
    
        // Thêm quyền "all" vào danh sách permissions
        const allPermissions = (
            await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
        ).map((p) => p.ChucNang);
    
        permissions = permissions.concat(allPermissions);
        permissions.push("admin");
        let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
        res.render('admin/create_account', {
            layout: "admin",
            permissions,
            action,
        });
      } catch (error) {
          console.log(error);
      }
  }

  // get data from create form and add new account
  async store(req, res) {
    try {
      const { employee, permission, password, confirm_password } = req.body;
      const [employee_id, employee_name] = employee.split(" - ");
      const [permission_id, permission_name] = permission.split(" - ");
      if (password !== confirm_password){
        return res.status(400).send("Mật khẩu không khớp");
      }
      await accountConfig.update(employee_id, permission_id, password);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
      res.redirect("/admin/account");
    } catch (error) {
      console.log(error);
    }
  }

  // update data form
  async update(req, res) {
    try {
      const { id } = req.params;
      const account = (await accountConfig.get_account_info(id))[0];
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      permissions.push("admin");
      let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
      res.render("admin/update_account", {
        account,
        layout: "admin",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // get data from update and edit account
  async edit(req, res) {
    try {
      const { employee, permission, password, confirm_password } = req.body;
      const [employee_id, employee_name] = employee.split(" - ");
      const [permission_id, permission_name] = permission.split(" - ");
      if (password !== confirm_password){
        return res.status(400).send("Mật khẩu không khớp");
      }
      await accountConfig.update(employee_id, permission_id, password);

      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
      res.redirect("/admin/account");
    } catch (error) {
      console.log(error);
    }
  }

  // delete data
  async delete(req, res) {
    try {
      await accountConfig.delete(req.params.id);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "taikhoan");
      res.redirect("/admin/account");
    } catch (error) {
      console.log(error);
    }
  }

  // create excel
  async create_excel(req, res) {
    try {
      const data = await accountConfig.getAll(); // Lấy dữ liệu từ DB
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách tài khoản");

      // Định nghĩa các cột
      worksheet.columns = [
        { header: "Mã Nhân Viên", key: "IDNhanVien", width: 15 },
        { header: "Tên Nhân Viên", key: "TenNhanVien", width: 30 },
        { header: "Ngày Sinh", key: "NgaySinh", width: 20 },
        { header: "SĐT", key: "SDT", width: 15 },
        { header: "Email", key: "Mail", width: 30 },
        { header: "Số Nhà / Đường", key: "SoNhaDuong", width: 25 },
        { header: "Phường / Xã", key: "PhuongXa", width: 25 },
        { header: "Quận / Huyện", key: "QuanHuyen", width: 25 },
        { header: "Tỉnh / Thành Phố", key: "TinhThanhPho", width: 25 },
        { header: "Vị trí", key: "ViTri", width: 20 },
        { header: "Ngày Vào Làm", key: "NgayVaoLam", width: 20 },
        { header: "Lương", key: "Luong", width: 15 },
      ];

      // Thêm dữ liệu
      data.forEach((item, index) => {
        worksheet.addRow({
          ...item,
          NgaySinh: new Date(item.NgaySinh),
          NgayVaoLam: new Date(item.NgayVaoLam),
        });
      });

      // Format ngày
      worksheet.getColumn("NgaySinh").eachCell((cell, rowNumber) => {
        if (rowNumber > 1 && cell.value instanceof Date) {
          cell.value = moment(cell.value).format("DD/MM/YYYY");
        }
      });
      worksheet.getColumn("NgayVaoLam").eachCell((cell, rowNumber) => {
        if (rowNumber > 1 && cell.value instanceof Date) {
          cell.value = moment(cell.value).format("DD/MM/YYYY");
        }
      });
      // Format tiền
      worksheet.getColumn("Luong").eachCell((cell, rowNumber) => {
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
        "attachment; filename=ds_taikhoan.xlsx"
      );
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log(error);
    }
  }
}

// module.exports = new AccountController();
export default new AccountController();
