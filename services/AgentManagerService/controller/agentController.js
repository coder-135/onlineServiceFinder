const AgentBusinessLogic = require('../businessLogic/agentBusinessLogic');
const AgentRepository = require('../repository/agentRepository');
const validate = require('../../../utility/validator');
const {agentSchema} = require('../../../utility/schema');

class AgentController {
  constructor() {
  }

  async signup(req, res) {
    try {
      await validate(req.body, agentSchema);
      const inputData = {
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        nationalId: req.body.nationalId,
        birthDate: req.body.birthDate,
        maritalStatus: req.body.maritalStatus,
        skills: JSON.parse(req.body.skills),
        landline: req.body.landline,
        address: req.body.address,
        geoLocation: {lat: +req.body.lat, lng: +req.body.lng},
        fatherName: req.body.fatherName,
        gender: req.body.gender,
        role: 'agent',
        avatarUrl: 'https://hive1400.ir/uploads/avatars/880bcef8-2037-4890-8dbe-730d903e6f00.jpg',
        password: req.body.password,
        serviceCounter: 0,
        amazingServiceCounter: 0,
        totalRates: 0,
        raterCount: 0,
        rate: 0,
        status: false,
        paymentStatus: false,
        categoryIds: null,
        ip: req.headers["x-real-ip"] || req.ip
      };

      if (inputData.password !== req.body.confirmPassword)
        throw {
          status: 400,
          data: {
            message: "رمز عبور تطابق ندارد"
          }
        }

      let result = await new AgentBusinessLogic().signup(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async updateAgent(req, res) {
    try {
      if (!req.body.agentId) {
        throw {
          data: {
            message: 'شناسه کارگذار ارسال نشده است'
          }
        }
      }
      let inputData = req.body;
      if (!inputData.phoneNumber) {
        const agent = await new AgentRepository().getAgent('agentId', req.body.agentId);
        inputData.phoneNumber = agent.phoneNumber
      }


      let result = await new AgentBusinessLogic().updateAgent(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async login(req, res) {
    try {
      const inputData = {
        nationalId: req.body.nationalId,
        password: req.body.password,
        ip: req.headers["x-real-ip"] || req.ip
      };
      let result = await new AgentBusinessLogic().login(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async sendOtp(req, res) {
    try {
      let result;
      const inputData = {
        phoneNumber: req.body.phoneNumber,
        otp: req.body.otp ? req.body.otp : null
      }
      // const agent = await new AgentRepository().getAgent('phoneNumber', inputData.phoneNumber);
      // if (agent) {
      //   throw {
      //     status: 409,
      //     data: {
      //       message: "شماره مورد نظر قبلا در سیستم ثبت شده است"
      //     }
      //   }
      // }

      if (req.body.otp) {
        result = await new AgentBusinessLogic().checkOtp(inputData, 'signup')
      } else {
        result = await new AgentBusinessLogic().sendOtp(inputData, 'signup');
      }
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
      });
    }
  }

  async sendResetPasswordOtp(req, res) {
    try {
      let result;
      const inputData = {
        phoneNumber: req.body.phoneNumber,
        nationalId: req.body.nationalId,
        otp: req.body.otp ? req.body.otp : null
      }
      const agent = await new AgentRepository().getAgent('phoneNumber', inputData.phoneNumber);
      if (!agent) {
        throw {
          status: 404,
          data: {
            message: "شماره مورد نظر در سیستم ثبت نشده است"
          }
        }
      }
      if (inputData.nationalId !== agent.nationalId) {
        throw {
          status: 400,
          data: {
            message: 'کد ملی وارد شده با کد ملی ثبت شده در سیستم تطابق ندارد'
          }
        }
      }
      if (req.body.otp) {
        result = await new AgentBusinessLogic().checkOtp(inputData, 'resetPassword')
      } else {
        result = await new AgentBusinessLogic().sendOtp(inputData, 'resetPassword');
      }
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
      });
    }
  }

  async updateOtp(req, res) {
    try {
      let result;
      const inputData = {
        phoneNumber: req.body.phoneNumber,
        otp: req.body.otp ? req.body.otp : null
      }
      const agent = await new AgentRepository().getAgent('phoneNumber', inputData.phoneNumber);
      if (inputData.phoneNumber !== agent.phoneNumber) {
        throw {
          status: 400,
          data: {
            message: 'شماره موبایل وارد شده با شماره ثبت شده در سیستم تطابق ندارد'
          }
        }
      }
      if (req.body.otp) {
        result = await new AgentBusinessLogic().checkUpdateOtp(inputData)
      } else {
        result = await new AgentBusinessLogic().sendOtp(inputData, 'update');
      }
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
      });
    }
  }

  async resetPassword(req, res) {
    try {
      if (req.body.newPassword !== req.body.confirmNewPassword)
        throw {
          data: {
            message: "رمز عبور تطابق ندارد"
          }
        }
      const inputData = {
        nationalId: req.body.nationalId,
        password: req.body.newPassword,
      }
      const result = await new AgentBusinessLogic().resetPassword(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
      });
    }
  }

  async checkPaymentStatus(req, res) {
    try {
      if (!req.query.nationalId) {
        throw {
          data: {
            message: 'کد ملی ارسال نشده است'
          }
        }
      }
      const nationalId = req.query.nationalId;
      const result = await new AgentBusinessLogic().checkPaymentStatus(nationalId);
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

module.exports = AgentController;