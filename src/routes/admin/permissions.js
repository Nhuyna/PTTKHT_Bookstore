import express from "express";
const router = express.Router();
import {
  isLoggedIn,
  redirectByRole,
  checkRole,
  checkPermission,
} from "../../app/middlewares/admin/auth.js";
import Permission from "../../app/controllers/admin/Permissions.js";
router.get("/create", Permission.create);
router.get("/update/:id", Permission.editForm); // hiển thị form sửa

router.post("/update", Permission.update);
router.get("/delete/:id", Permission.delete);
router.get("/", Permission.show);

export default router;
