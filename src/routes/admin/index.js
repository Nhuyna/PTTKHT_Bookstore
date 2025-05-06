import express from "express";
// import {
//   isLoggedIn,
//   redirectByRole,
//   checkRole,
//   checkPermission,
// } from "../../app/middlewares/admin/auth.js";
import Dashboard from "../../app/controllers/admin/DashboardController.js";
import Permission from "../../app/controllers/admin/Permissions.js";
const router = express.Router();

router.get("/permissions", Permission.show);

router.get("/", Dashboard.show);
export default router;
