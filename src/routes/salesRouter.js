import express from "express";
import orderRouter from "./sales/orders.js";
import DashboardController from "../app/controllers/sales/DashboardController.js";
import statisticRouter from "./sales/statistic.js";
import customerRouter from "./sales/customers.js";
import {
  isLoggedIn,
  redirectByRole,
  checkRole,
  checkPermission,
} from "../app/middlewares/admin/auth.js";

const router = express.Router();

router.use(
  "/orders",
  isLoggedIn,
  checkPermission(["qlhdx", "qlbanhang", "qldoanhnghiep"]),
  orderRouter
);
router.use(
  "/khachhang",
  isLoggedIn,
  checkPermission(["qlkhachhang", "qlbanhang"]),
  customerRouter
);

router.use(
  "/statistic",
  isLoggedIn,
  checkPermission(["qlthongkexuat", "qlbanhang", "qldoanhnghiep"]),
  statisticRouter
);

router.get("/", DashboardController.show);

export default router;
