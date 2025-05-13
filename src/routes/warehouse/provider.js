// const express = require('express');
// const ProviderController = require('../controller/ProviderController');
import express from "express";
const router = express.Router();
import ProviderController from "../../app/controllers/warehouse/ProviderController.js";

router.get("/search", ProviderController.search);

router.get("/delete_opt", ProviderController.delete_opt);

router.get("/on_cooperate", ProviderController.on_cooperate);

router.get("/create", ProviderController.create);

router.get("/create_excel", ProviderController.create_excel);

router.post("/store", ProviderController.store);

router.get("/view/:id", ProviderController.view);

router.get("/update/:id", ProviderController.update);

router.post("/edit", ProviderController.edit);

router.get("/delete/:id", ProviderController.delete);

router.get("/", ProviderController.index);

// module.exports = router;
export default router;
