const router = require('express').Router();
const DashboardController = require('./controller/dashboardController');
const {uploadAvatar} = require('../../utility/uploader');

router.post('/dashboard/uploadAvatar',
  uploadAvatar.single('profile'), DashboardController.prototype.uploadAvatar);

router.delete('/dashboard/deleteAvatar', DashboardController.prototype.deleteAvatar);
module.exports = router;