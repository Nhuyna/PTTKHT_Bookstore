import phanquyen from "../../model/admin/phanquyenModel.js";
import perModel from "../../model/admin/permissionsModel.js";
class Permissions {
  async show(req, res) {
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);

    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);

    permissions = permissions.concat(allPermissions);

    let action = await phanquyen.action(req.session.user.idNQ, "admin");
    console.log("NÈ" + action);
    try {
      console.log("Vào per nè");
      const listper = await perModel.getAll();
      console.log(listper);
      res.render("admin/permissions", {
        title: "Permissions",
        cssFiles: ["admin/style"],
        layout: "admin",
        listper,
        permissions,
        action,
      });
    } catch (error) {}
  }
  async create(req, res) {
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);

    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);
    const roles = await perModel.getRolesWithPermissions();
    console.log("ê", roles);
    permissions = permissions.concat(allPermissions);
    let action = await phanquyen.action(req.session.user.idNQ, "admin");
    try {
      console.log("Vào per nè");
      const listper = await perModel.getAll();
      // console.log(listper);
      console.log("action nè: " + action);

      res.render("admin/createpm", {
        title: "Permissions",
        cssFiles: ["admin/style"],
        layout: "admin",
        listper,
        permissions,
        action,
        roles,
      });
    } catch (error) {}
  }
  // controllers/admin/PermissionController.js

  async update(req, res) {
    try {
      console.log(
        "Dữ liệu nhận được từ client:",
        JSON.stringify(req.body, null, 2)
      );

      const ds = req.body;
      const result = await phanquyen.addRoleToTable(req.body.name);
      for (let group in ds.quyen) {
        for (let role in ds.quyen[group]) {
          for (let permission of ds.quyen[group][role]) {
            console.log(
              "Giờ thêm nè: " + result + " " + role + " " + permission
            );
            await phanquyen.addPermissionsToTable(result, role, permission);
          }
        }
      }

      res.redirect("/admin/permissions");
    } catch (err) {
      console.error("Lỗi khi xử lý dữ liệu:", err);
      res.status(500).send("Có lỗi xảy ra");
    }
  }
  async delete(req, res) {
    try {
      const roleId = req.params.id;
      console.log("ID nhóm quyền cần xóa:", roleId);

      // Gọi model để xóa
      const result = await phanquyen.deleteRoleById(roleId);
      console.log("Kết quả xóa:", result);

      res.redirect("/admin/permissions");
    } catch (err) {
      console.error("Lỗi khi xóa nhóm quyền:", err);
      res.status(500).send("Có lỗi xảy ra khi xóa nhóm quyền");
    }
  }
  async editForm(req, res) {
    const id = req.params.id;
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);
    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);
    permissions = permissions.concat(allPermissions);
    let action = await phanquyen.action(req.session.user.idNQ, "admin");

    const role = await perModel.getRoleById(id); // thêm hàm này trong perModel
    const roles = await perModel.getRolesWithPermissions(); // tất cả nhóm + quyền

    const existingPermissions = await perModel.getPermissionsOfRole(id); // thêm hàm này luôn
    console.log("role nè", role); // ✅ In rõ object
    console.log("roles:", roles); // ✅ In rõ mảng object
    console.log("ex:", existingPermissions); // ✅ In rõ danh sách quyền
    const quyenCha = await phanquyen.findQuyenChaFromPermissions(
      existingPermissions
    );
    // console.log("Quyền cha của role là:", quyenCha);
    res.render("admin/updatepm", {
      title: "Cập nhật Nhóm quyền",
      cssFiles: ["admin/style"],
      layout: "admin",
      role,
      existingPermissions, // quyền đang có
      roles,
      listper: roles,
      permissions,
      action,
      selectedRoleId: [quyenCha],
    });
  }
}

export default new Permissions();
