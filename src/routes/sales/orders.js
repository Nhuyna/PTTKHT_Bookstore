import express from "express";
import orderController from "../../app/controllers/sales/OrderController.js";

const router = express.Router();

router.get("/show", orderController.show);
router.get("/export-excel", orderController.exportOrdersExcel);
router.get("/:id/exportPdf", orderController.exportOrderPdf);
router.post("/:id/confirmPayment", orderController.updatePaymentStatus);
router.post("/:id/confirmRefund", orderController.updatePaymentStatus);
router.post("/:id/confirmReturnRequest", orderController.updateStatus);
router.post("/:id/updateShippingStatus", orderController.updateStatus);
router.post("/:id/confirmOrder", orderController.updateStatus);
router.post("/:id/cancelOrder", orderController.updateStatus);
router.post("/:id/archive", orderController.updateArchive);
router.post("/:id/unarchive", orderController.updateArchive);
router.get("/:id", orderController.showById);
export default router;
