const router = require('express').Router();
const WalletController = require('./controller/walletController');

router.get('/wallet/stock', WalletController.prototype.getStock);
router.get('/wallet/withdrawal', WalletController.prototype.withdrawal);
router.post('/wallet/IBAN', WalletController.prototype.addIBAN)
router.get('/wallet/IBAN', WalletController.prototype.getIBAN)
router.put('/wallet/IBAN', WalletController.prototype.updateIBAN)

module.exports = router;