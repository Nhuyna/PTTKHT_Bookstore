import express from "express";

import DashboardController from "../app/controllers/admin/DashboardController.js";
import Permissions from "../app/controllers/admin/Permissions.js";
const router = express.Router();
// router.use("/", Permissions.index);

router.use("/", Permissions.show);

export default router;
