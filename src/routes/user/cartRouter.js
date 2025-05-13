import express from "express";
import cartController from "../../app/controllers/user/cartController.js";

const router = express.Router();
router.get("/thanhtoan/:id?", cartController.thanhtoan);
router.post("/thanhtoan", cartController.thanhtoan);

router.post("/confirm", cartController.afterpayment);
router.get("/confirm", cartController.renderThankYouPage);
router.post("/addToCart", cartController.addToCart);
router.post("/cartCount", cartController.getcartCount);
router.post("/update", cartController.updateQuantity);
router.post("/delete", cartController.deleteCartItem);
router.get("/", cartController.renderCartPage);

export default router;
