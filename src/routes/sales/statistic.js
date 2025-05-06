import express from "express";
import StatisticController from "../../app/controllers/sales/StatisticController.js";

const router = express.Router();
// API xuất Excel
router.get("/api/export", StatisticController.exportToExcel);

// Trang thống kê - server-side rendering
router.get("/", StatisticController.show);

export default router;
