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
        const result = await accountConfig.get_permission();
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
            result
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
      if (password !== confirm_password){
        return res.status(400).send("Mật khẩu không khớp");
      }
      await accountConfig.update_change_password(employee_id, permission, password);
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
      const result = await accountConfig.get_permission();
      // Gắn selected cho nhóm quyền hiện tại
      const updatedResult = result.map((p) => {
        return {
          ...p,
          selected: p.ID_NhomQuyen === account.ID_NhomQuyen
        };
      });

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
        result: updatedResult // sử dụng result đã xử lý
      });
    } catch (error) {
      console.log(error);
    }
  }

  // get data from update and edit account
  async edit(req, res) {
    try {
      const { employee, permission, change_option, password, confirm_password } = req.body;
      const [employee_id, employee_name] = employee.split(" - ");
      if (change_option === "old"){
        await accountConfig.update_old_password(employee_id, permission, password);
      } else {
        if (password !== confirm_password){
          return res.status(400).send("Mật khẩu không khớp");
        }
        await accountConfig.update_change_password(employee_id, permission, password);
      }

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
}

// module.exports = new AccountController();
export default new AccountController();
