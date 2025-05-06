// app/controllers/admin/AdminController.js
import AdminModel from "../../model/admin/adminModel.js";
import phanquyen from "../../model/admin/phanquyenModel.js";

class AdminController {
  showLogin(req, res) {
    res.render("admin/login", { layout: false });
  }

  async handleLogin(req, res) {
    const { id, password } = req.body;
    const user = await AdminModel.findByID(id);

    if (!user || user.MatKhau !== password) {
      return res.render("admin/login", {
        layout: "admin",
        error: "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.",
      });
    }

    const accessPermissions = await phanquyen.findPAccessIdNhomQuyen(
      user.ID_NhomQuyen,
      "access"
    );
    console.log("hi" + accessPermissions);
    req.session.user = {
      id: user.ID_TK,
      idNQ: user.ID_NhomQuyen,
      TenNhomQuyen: user.TenNhomQuyen.toLowerCase(),
      accessList: accessPermissions.map((item) => item.ChucNang),
    };

    console.log("Session user:", req.session.user);

    req.session.save((err) => {
      if (err) {
        console.error("Lỗi lưu session:", err);
        return res.status(500).send("Lỗi hệ thống khi đăng nhập.");
      }

      const accessRedirectMap = {
        admin: "/admin/",
        qlkho: "/admin/warehouse",
        qlbanhang: "/admin/sales",
        qldoanhnghiep: "/admin/dashboard",
      };

      if (req.session.user.accessList.length === 1) {
        const onlyAccess = req.session.user.accessList[0];
        const redirectURL = accessRedirectMap[onlyAccess] || "/admin/dashboard";
        return res.redirect(redirectURL);
      } else if (req.session.user.accessList.length > 1) {
        return res.redirect("/admin/dashboard");
      } else {
        return res.render("errors/403", {
          layout: false,
          error: "Không tìm thấy quyền truy cập.",
        });
      }
    });
  }
}

export default new AdminController();
