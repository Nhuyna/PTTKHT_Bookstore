import phanquyen from "../../model/admin/phanquyenModel.js";
class DashboardController {
  async show(req, res) {
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);

    // Thêm quyền "all" vào danh sách permissions
    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);
    console.log("per admin: ", permissions);
    permissions = permissions.concat(allPermissions);
    permissions.push("admin");
    try {
      res.render("admin/dashboard", {
        title: "Dashboard",
        // cssFiles: ["admin/style"],
        layout: "admin",
        permissions,
      });
    } catch (error) {}
  }
}

export default new DashboardController();
