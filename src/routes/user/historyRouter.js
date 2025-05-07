import express from "express";
const router = express.Router();
import historyController from "../../app/controllers/user/historyController.js";

// Sử dụng renderHistoryPage như một hàm callback
router.get("/", historyController.renderHistoryPage);

export default router;
