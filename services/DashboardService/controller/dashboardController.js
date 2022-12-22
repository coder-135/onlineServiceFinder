const DashboardBusinessLogic = require('../businessLogic/dashboardBusinessLogic');
const AccessManager = require('../../../utility/accessManagerService/accessManager')

class DashboardController {
  constructor() {
  }

  async uploadAvatar(req, res) {
    try {
      await new AccessManager().checkAccessControl(req, res, 'avatar');
      if (!req.file) throw {
        status: 400,
        data: {message: 'عکسی انتخاب نشده است'}
      }
      const inputData = {
        nationalId: req.nationalId,
        role: req.role,
        avatarUrl: `https://hive1400.ir/uploads/avatars/${req.file.filename}`
      }
      let result = await new DashboardBusinessLogic().uploadAvatar(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }
  async deleteAvatar(req, res) {
    try {
      await new AccessManager().checkAccessControl(req, res, 'avatar')
      const inputData = {
        nationalId: req.nationalId,
        role: req.role
      }
      let result = await new DashboardBusinessLogic().deleteAvatar(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }


}

module.exports = DashboardController;