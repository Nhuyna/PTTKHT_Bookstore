// const express = require('express');
// const CategoryController = require('../controller/CategoryController');
import express from "express";
const router = express.Router();
import CategoryController from "../../app/controllers/warehouse/CategoryController.js";

router.get("/view/:id", CategoryController.view);

router.get("/create", CategoryController.create);

router.post("/store", CategoryController.store);

router.get("/update/:id", CategoryController.update);

router.post("/edit", CategoryController.edit);

router.get("/delete/:id", CategoryController.delete);

router.get("/", CategoryController.index);

// module.exports = router;
export default router;
