const router = require('express').Router();
const PaymentController = require('./controller/paymentController');
const multer = require('multer');
const upload = multer();

router.post('/payment/request', PaymentController.prototype.paymentRequest);
router.post('/payment/verify', upload.none(), PaymentController.prototype.verifyPayment);
router.get('/payment/check', PaymentController.prototype.checkPayment)

module.exports = router;