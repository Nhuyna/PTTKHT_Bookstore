// routes/adminRouters.js
import express from "express";
const router = express.Router();
import AdminController from "../app/controllers/admin/AdminController.js";
import {
  isLoggedIn,
  redirectByRole,
  checkRole,
} from "../app/middlewares/admin/auth.js";

import Dashboard from "../app/controllers/admin/DashboardController.js";
import adminRouter from "./admin/index.js";
import warehouseRouter from "./warehouse/index.js";
import salesRouter from "./salesRouter.js";
import dashboardRouter from "./dashboardRouter.js";

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("connect.sid"); // Xóa cookie session
    res.redirect("login");
  });
});

router.get("/login", AdminController.showLogin);
router.post("/login", AdminController.handleLogin);
router.use(
  "/warehouse",
  isLoggedIn,
  checkRole(["qlkho", "qldoanhnghiep"]),
  warehouseRouter
);
router.use(
  "/sales",
  isLoggedIn,
  checkRole(["qlbanhang", "qldoanhnghiep"]),
  salesRouter
);
router.use(
  "/dashboard",
  isLoggedIn,
  checkRole(["admin", "qldoanhnghiep"]),
  dashboardRouter
);
router.use(
  "/", 
  isLoggedIn, 
  checkRole(["admin", "qldoanhnghiep"]),
  adminRouter
);
router.get("/", isLoggedIn, Dashboard.show);

export default router;
