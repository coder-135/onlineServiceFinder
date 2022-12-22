const WalletBusinessLogic = require('../businessLogic/walletBusinessLogic');
const AccessManager = require('../../../utility/accessManagerService/accessManager');
const moment = require('moment-jalaali');
const uuid = require('uuid');

class WalletController {
  constructor() {
  }

  async getStock(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      const inputData = {
        id: req.query.id
      }
      let result = await new WalletBusinessLogic().getStock(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }
  async withdrawal(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      const inputData = {
        id: req.query.id
      }
      let result = await new WalletBusinessLogic().withdrawal(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }
  async addIBAN(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      //todo validation needed
      const inputData = {
        agentId: req.body.agentId,
        fullName: req.body.fullName,
        bankName: req.body.bankName,
        IBAN: req.body.IBAN,
        id: uuid.v4(),
        status: false
      }
      let result = await new WalletBusinessLogic().addIBAN(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }
  async getIBAN(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      const inputData = {
        agentId: req.query.agentId
      }
      let result = await new WalletBusinessLogic().getIBAN(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }
  async updateIBAN(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      if(!req.body.agentId){
        throw {
          data:{
            message: 'شناسه کارگذار ارسال نشده است'
          }
        }
      }
      const inputData = req.body;
      let result = await new WalletBusinessLogic().updateIBAN(inputData);
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

module.exports = WalletController;