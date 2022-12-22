const router = require('express').Router();
const FactorController = require('./controller/factorController');

router.get('/factor/agent',  FactorController.prototype.getAgentFactor);
router.get('/factor/dailyIncome',  FactorController.prototype.getDailyIncome);


module.exports = router;