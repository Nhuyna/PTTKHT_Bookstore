import express from "express";
import {
  isLoggedIn,
  redirectByRole,
  checkRole,
  checkPermission,
} from "../../app/middlewares/admin/auth.js";
import Dashboard from "../../app/controllers/admin/DashboardController.js";
import permissionRouter from "./permissions.js";
import employeeRouter from "./employee.js";
import accountRouter from "./account.js";
const router = express.Router();

router.use(
    "/permissions",
    isLoggedIn,
    checkPermission(["nhomquyen", "admin", "qldoanhnghiep"]),
    permissionRouter
);
router.use(
  "/employee",
  isLoggedIn,
  checkPermission(["nhanvien", "admin", "qldoanhnghiep"]),
  employeeRouter
);
router.use(
  "/account",
  isLoggedIn,
  checkPermission(["taikhoan", "admin", "qldoanhnghiep"]),
  accountRouter
);
router.get("/", Dashboard.show);
export default router;
