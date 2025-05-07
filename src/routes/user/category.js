import express from "express";
const router = express.Router();
import categoryController from "../../app/controllers/CategoryController.js";

router.get("/:id?", categoryController.index);
module.exports = router;
