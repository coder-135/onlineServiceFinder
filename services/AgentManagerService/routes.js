const router = require('express').Router();
const AgentController = require('./controller/agentController');



//ثبت نام کارگذار
router.post('/agent/otp', AgentController.prototype.sendOtp);
router.post('/agent/signup', AgentController.prototype.signup);

// ویرایش کارگذار
router.post('/agent/updateOtp',AgentController.prototype.updateOtp);
router.put('/agent/update', AgentController.prototype.updateAgent);

//لاگین کارگذار
router.put('/agent/login', AgentController.prototype.login);


//فراموشی رمز عبور کارگذار
router.post('/agent/resetPasswordOtp',AgentController.prototype.sendResetPasswordOtp);
router.post('/agent/resetPassword',AgentController.prototype.resetPassword);



router.get('/agent/status',AgentController.prototype.checkPaymentStatus)

module.exports = router;