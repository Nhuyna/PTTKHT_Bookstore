// const categoryConfig = require('../db/category');
import categoryConfig from "../../model/warehouse/category.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
class CategoryController {
  // show all category

  async index(req, res) {
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);

    // Thêm quyền "all" vào danh sách permissions
    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);

    permissions = permissions.concat(allPermissions);
    let action = await phanquyen.action(req.session.user.idNQ, "qldanhmuc");
    console.log(action);
    try {
      const category = await categoryConfig.getAll();
      res.render("warehouse/category", {
        layout: "warehouse",
        category,
        permissions,
        action,
      });
    } catch (err) {
      console.log(err);
    }
  }

  // search category
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
      const { id } = req.params;
      let action = await phanquyen.action(req.session.user.idNQ, "qldanhmuc");
      res.render("warehouse/category", { layout: "warehouse" }, permissions),
        action;
    } catch (err) {
      console.log(err);
    }
  }

  // view detail category
  async view(req, res) {
    try {
      const { id } = req.params;
      let category_detail = await categoryConfig.viewProduct(id);
      // Hàm kiểm tra xem tất cả giá trị trong object có phải là null không
      const isAllNull = (obj) =>
        Object.values(obj).every((value) => value === null);
      // Lọc bỏ những object có tất cả giá trị là null
      category_detail = category_detail.filter((sp) => !isAllNull(sp));
      const detail_header = (await categoryConfig.detailHeader(id))[0];
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      console.log(permissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qldanhmuc");
      res.render("warehouse/view_category", {
        detail_header,
        category_detail,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // create form
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
      console.log(permissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qldanhmuc");
      res.render("warehouse/create_category", {
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // get data from create form and add new category
  async store(req, res) {
    try {
      const { name } = req.body;
      await categoryConfig.insert(name);
      res.redirect("/admin/warehouse/category");
    } catch (error) {
      console.log(error);
    }
  }

  // update data form
  async update(req, res) {
    try {
      const { id } = req.params;
      const edit_category = (await categoryConfig.search(id))[0];
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      console.log(permissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qldanhmuc");
      res.render("warehouse/update_category", {
        edit_category,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // get data from update and edit category
  async edit(req, res) {
    try {
      const { id, name } = req.body;
      await categoryConfig.update(id, name);
      res.redirect("/admin/warehouse/category");
    } catch (error) {
      console.log(error);
    }
  }

  // delete data
  async delete(req, res) {
    try {
      await categoryConfig.delete(req.params.id);
      res.redirect("/admin/warehouse/category");
    } catch (error) {
      console.log(error);
    }
  }
}

// module.exports = new CategoryController();
export default new CategoryController();
