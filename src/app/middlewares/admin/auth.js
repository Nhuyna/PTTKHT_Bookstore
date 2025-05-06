// middlewares/auth.js
import phanquyen from "../../model/admin/phanquyenModel.js";
export const isLoggedIn = (req, res, next) => {
  console.log(">> Kiểm tra session:", req.session);
  if (req.session && req.session.user) {
    console.log(">> Đã đăng nhập:", req.session.user);

    return next();
  }
  return res.redirect("/admin/login");
};

export function redirectByRole(req, res) {
  const role = req.session.user?.TenNhomQuyen;
  console.log("Ê" + req.session.user.TenNhomQuyen);
  if (role === "admin") return res.redirect("/admin/dashboard");
  if (role === "sales") return res.redirect("/admin/sales");
  if (role === "warehouse") return res.redirect("/admin/warehouse");

  res.redirect("/admin/login");
}
// middleware/authMiddleware.js
export function checkRole(...allowedRoles) {
  return (req, res, next) => {
    // allowedRoles = allowedRoles[0];

    // let tmp = allowedRoles[0];
    // allowedRoles = tmp;

    // console.log(allowedRoles);
    // const accessList = req.session.user?.accessList || [];
    // const hasAccess = allowedRoles.some((access) =>
    //   accessList.includes(access)
    // );

    const roles = Array.isArray(allowedRoles[0])
      ? allowedRoles[0]
      : allowedRoles;

    console.log(roles);
    const accessList = req.session.user?.accessList || [];
    const hasAccess = roles.some((access) => accessList.includes(access));

    if (hasAccess) return next();

    return res.status(403).render("errors/403", { layout: false });
  };
}
// middlewares/checkPermission.js
export function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      console.log(">> [checkPermission] Session user:", req.session.user); // 👈 thêm dòng này

      const idNQ = req.session.user?.idNQ;
      if (!idNQ) {
        console.log(">> Không có idNQ trong session");
        return res.redirect("/admin/login");
      }

      const tmp = (await phanquyen.findPAccessIdNhomQuyen(idNQ, "view")).map(
        (p) => p.ChucNang
      );

      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(idNQ, "all")
      ).map((p) => p.ChucNang);
      const permissions = [...tmp, ...allPermissions];
      // permissions = permissions.concat(allPermissions);
      const userPermissions = permissions;
      console.log(
        ">> [checkPermission] Các quyền người dùng:",
        userPermissions
      );
      const hasPermission = userPermissions.some((perm) =>
        requiredPermission.includes(perm)
      );
      console.log("has nè" + hasPermission);
      if (!hasPermission) {
        return res.status(403).render("errors/403", {
          message: "Không có quyền truy cập!",
          layout: false,
        });
      }

      console.log(
        ">> [checkPermission] Được phép truy cập:",
        requiredPermission
      );
      next();
    } catch (err) {
      console.error("Permission check failed:", err);
      return res.status(500).send("Lỗi hệ thống.");
    }
  };
}

export function checkAction(require, yc) {
  return async (req, res, next) => {
    try {
      const actions = await phanquyen.action(req.session.user.idNQ, yc);
      console.log(actions);
      console.log(require);
      const hasPermission = actions.some((action) => require.includes(action));

      console.log("Đây: " + hasPermission);
      if (hasPermission) {
        return next();
      } else {
        return res.status(403).render("errors/403", {
          message: "Bạn không có quyền thực hiện chức năng này.",
          user: req.session.user, // nếu muốn truyền thông tin người dùng
          layout: false,
        });
      }
    } catch (error) {
      console.error("Lỗi kiểm tra quyền:", error);
      return res.status(500).send("Lỗi máy chủ.");
    }
  };
}
