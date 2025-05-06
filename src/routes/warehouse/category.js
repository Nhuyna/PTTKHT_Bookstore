// const express = require('express');
// const CategoryController = require('../controller/CategoryController');
import express from "express";
const router = express.Router();
import CategoryController from "../../app/controllers/warehouse/CategoryController.js";
import { checkAction } from "../../app/middlewares/admin/auth.js";

router.get("/view/:id", CategoryController.view);

router.get(
  "/create",
  checkAction(["all", "create"], "qldanhmuc"),
  CategoryController.create
);

router.post("/store", CategoryController.store);

router.get(
  "/update/:id",
  checkAction(["all", "edit"], "qldanhmuc"),
  CategoryController.update
);

router.post(
  "/edit",
  checkAction(["all", "edit"], "qldanhmuc"),
  CategoryController.edit
);

router.get(
  "/delete/:id",
  checkAction(["all", "delete"], "qldanhmuc"),
  CategoryController.delete
);

router.get("/", CategoryController.index);

// module.exports = router;
export default router;
