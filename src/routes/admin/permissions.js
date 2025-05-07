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
router.post("/create", Permission.createpost);
router.get("/update/:id", Permission.editForm);
router.get("/view/:id", Permission.view);
router.post("/update/:id", Permission.update);
router.get("/delete/:id", Permission.delete);
router.get("/", Permission.show);

export default router;
