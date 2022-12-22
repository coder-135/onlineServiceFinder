const router = require('express').Router();
const ServiceController = require('./controller/serviceController');
const {uploadAvatar} = require('../../utility/uploader');

router.post('/service/cancel',  ServiceController.prototype.addCancellation);
router.get('/service/history', ServiceController.prototype.historyService);
router.get('/service/single', ServiceController.prototype.singleService)
router.get('/service/reservedServices', ServiceController.prototype.getReservedServices);
router.get('/service/vipServices', ServiceController.prototype.getVipServices);
router.get('/service/discount', ServiceController.prototype.useDiscount);

module.exports = router;