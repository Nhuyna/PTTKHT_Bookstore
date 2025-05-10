import express from "express";

import DashboardController from "../app/controllers/admin/DashboardController.js";
const router = express.Router();

router.use("/", DashboardController.show);

export default router;
