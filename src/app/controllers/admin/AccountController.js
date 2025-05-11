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
        { header: "Mã Nhân Viên", key: "ID_NhanVien", width: 15 },
        { header: "Tên Nhân Viên", key: "TenNhanVien", width: 25 },
        { header: "Nhóm Quyền", key: "TenNhomQuyen", width: 20 },
        { header: "Mật Khẩu Tài Khoản", key: "MatKhau", width: 20 },
      ];

      // Thêm dữ liệu
      data.forEach((item, index) => {
        worksheet.addRow({
          ...item
        });
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
