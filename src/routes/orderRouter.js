
const express = require('express');
const router = express.Router();
const orderController = require('../app/controllers/orderController');
     

router.post('/thanhtoan', orderController.handleCheckout);
router.post('/huyDonHang',orderController.huyDonHang);
module.exports = router;
