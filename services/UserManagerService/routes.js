const router = require('express').Router();
const UserController = require('./controller/userController');



//ثبت نام
router.post('/user/otp', UserController.prototype.sendOtp);
router.post('/user/signup', UserController.prototype.signup);

//ویرایش
router.post('/user/updateOtp',UserController.prototype.updateOtp);
router.put('/user/update', UserController.prototype.updateUser);


//لاگین
router.put('/user/login', UserController.prototype.login);


//فراموشی رمز عبور
router.post('/user/resetPasswordOtp',UserController.prototype.sendResetPasswordOtp);
router.post('/user/resetPassword',UserController.prototype.resetPassword);


router.post('/user/VIP', UserController.prototype.addVIP);
router.get('/user/VIP', UserController.prototype.getVIP);

module.exports = router;