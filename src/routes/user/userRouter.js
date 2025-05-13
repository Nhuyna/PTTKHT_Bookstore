import express from "express";
import userController from "../../app/controllers/user/userController.js";

const router = express.Router();

router.get("/account", userController.renderAccountPage);

router.post("/changeInforUser", userController.changeUserInfo);

router.get("/errorPage", userController.errorPage);

router.post("/login", userController.login);
 
router.post("/changePasswordUser", userController.changePasswordUser);

router.post("/registration", userController.registerUser);

router.get("/logout", userController.logoutUser);

router.get("/check-session", userController.checkSession);

export default router;
