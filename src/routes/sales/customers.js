import express from "express";
import CustomerController from "../../app/controllers/sales/CustomerController.js";

const router = express.Router();

router.get("/detail/:id", CustomerController.getCustomerDetail);
router.get("/export", CustomerController.exportToExcel);
router.post("/delete/:id", CustomerController.deleteCustomer);

// Routes cho tạo khách hàng mới
router.get("/create", CustomerController.showCreateForm);
router.post("/store", CustomerController.createCustomer);
router.get("/edit/:id", CustomerController.showEditForm);
router.post("/update/:id", CustomerController.updateCustomer);
router.get("/", CustomerController.index);
export default router;
