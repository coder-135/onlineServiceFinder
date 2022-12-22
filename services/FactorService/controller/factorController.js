const FactorBusinessLogic = require('../businessLogic/factorBusinessLogic');
const AccessManager = require('../../../utility/accessManagerService/accessManager');
const moment = require('moment-jalaali');

class FactorController {
  constructor() {
  }

  async getAgentFactor(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      const inputData = {
        ownerId: req.query.id
      }
      let result = await new FactorBusinessLogic().getAgentFactor(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }
  async getDailyIncome(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      const inputData = {
        id: req.query.id
      }
      let result = await new FactorBusinessLogic().getDailyIncome(inputData);
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

module.exports = FactorController;