const ServiceBusinessLogic = require('../businessLogic/serviceBusinessLogic');
const AccessManager = require('../../../utility/accessManagerService/accessManager');
const {cancellationSchema} = require('../../../utility/schema');
const validate = require('../../../utility/validator');
const Yup = require("yup");

class ServiceController {
  constructor() {
  }

  async addCancellation(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      await validate(req.body, cancellationSchema);
      const inputData = {
        serviceCode: req.body.serviceCode,
        reasons: req.body.reasons,
        description: req.body.description ? req.body.description : null
      }
      let result = await new ServiceBusinessLogic().addCancellation(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async historyService(req, res) {
    try {
      let inputData = {};
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      // await validate(req.body, cancellationSchema);
      if (!req.query.agentId && !req.query.userId) {
        throw {
          data: {
            message: 'شناسه کارگذار یا کاربر ارسال نشده است'
          }
        }
      }
      if (req.query.agentId) {
        inputData.agentId = req.query.agentId
      } else {
        inputData.userId = req.query.userId
      }

      let result = await new ServiceBusinessLogic().historyService(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async singleService(req, res) {
    try {
      if (!req.query.serviceCode) {
        throw {
          data: {
            message: 'کد سرویس ارسال نشده است'
          }
        }
      }
      const inputData = {serviceCode: req.query.serviceCode};

      let result = await new ServiceBusinessLogic().singleService(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getReservedServices(req, res) {
    try {
      if (!req.query.agentId) {
        throw {
          data: {
            message: 'شناسه کارگذار ارسال نشده است'
          }
        }
      }
      const inputData = {
        agentId: req.query.agentId,
        serviceType: 'reservation'
      };
      let result = await new ServiceBusinessLogic().getReservedServices(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getVipServices(req, res) {
    try {
      if (!req.query.agentId) {
        throw {
          data: {
            message: 'شناسه کارگذار ارسال نشده است'
          }
        }
      }
      const inputData = {
        agentId: req.query.agentId,
        serviceType: 'normal',
        operatorStatus: true
      };
      let result = await new ServiceBusinessLogic().getVipServices(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }
  async useDiscount(req, res) {
    try {
      //todo check if this code belongs to this user or not
      if (!req.query.discountCode) {
        throw {
          data: {
            message: 'کد تخفیف ارسال نشده است'
          }
        }
      }
      const inputData = {
        code: req.query.discountCode
      };
      let result = await new ServiceBusinessLogic().useDiscount(inputData);
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

module.exports = ServiceController;