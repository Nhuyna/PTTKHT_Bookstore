import express from "express";
const router = express.Router();
import historyController from "../../app/controllers/user/historyController.js";


router.get("/", historyController.renderHistoryPage); 

export default router;
