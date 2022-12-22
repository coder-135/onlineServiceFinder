const UserBusinessLogic = require('../businessLogic/userBusinessLogic');
const UserRepository = require('../repository/userRepository');
const validate = require('../../../utility/validator');
const {userSchema} = require('../../../utility/schema');
const {endOfServiceSms} = require("../../../utility/smsSender");

class UserController {
  constructor() {
  }

  async signup(req, res) {
    try {
      await validate(req.body, userSchema);
      const inputData = {
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        nationalId: req.body.nationalId,
        birthDate: req.body.birthDate,
        fatherName: req.body.fatherName,
        gender: req.body.gender,
        role: 'user',
        avatarUrl: 'https://hive1400.ir/uploads/avatars/880bcef8-2037-4890-8dbe-730d903e6f00.jpg',
        serviceCounter: 0,
        totalRates: 0,
        raterCount: 0,
        rate: 0,
        password: req.body.password,
        VIP: [],
        ip: req.headers["x-real-ip"] || req.ip
      };
      let result = await new UserBusinessLogic().signup(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
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
      let result = await new UserBusinessLogic().login(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
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
      //test
      const user = await new UserRepository().getUser('phoneNumber', inputData.phoneNumber);
      // if (user) {
      //   throw {
      //     status: 409,
      //     data: {
      //       message: "شماره مورد نظر قبلا در سیستم ثبت شده است"
      //     }
      //   }
      // }

      if (req.body.otp) {
        result = await new UserBusinessLogic().checkOtp(inputData, 'signup')
      } else {
        result = await new UserBusinessLogic().sendOtp(inputData, 'signup');
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
      const user = await new UserRepository().getUser('phoneNumber', inputData.phoneNumber);
      if (!user) {
        throw {
          status: 404,
          data: {
            message: "شماره مورد نظر در سیستم ثبت نشده است"
          }
        }
      }
      if (req.body.otp) {
        result = await new UserBusinessLogic().checkOtp(inputData, 'resetPassword')
      } else {
        result = await new UserBusinessLogic().sendOtp(inputData, 'resetPassword');
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
      const result = await new UserBusinessLogic().resetPassword(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
      });
    }
  }

  async addVIP(req, res) {
    try {
      const inputData = {
        userId: req.body.userId,
        agentId: req.body.agentId
      }
      const result = await new UserBusinessLogic().addVIP(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data
      });
    }
  }

  async getVIP(req, res) {
    try {
      if (!req.query.userId) {
        throw {
          data: {message: 'شناسه ارسال نشده است'}
        }
      }
      const inputData = {
        userId: req.query.userId
      }
      const result = await new UserBusinessLogic().getVIP(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async updateUser(req, res) {
    try {
      if (!req.body.userId) {
        throw {
          data: {
            message: 'شناسه کاربر ارسال نشده است'
          }
        }
      }
      let inputData = req.body;
      if (!inputData.phoneNumber) {
        const user = await new UserRepository().getUser('userId', req.body.userId);
        inputData.phoneNumber = user.phoneNumber
      }


      let result = await new UserBusinessLogic().updateUser(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
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
      const user = await new UserRepository().getUser('phoneNumber', inputData.phoneNumber);
      if (inputData.phoneNumber !== user.phoneNumber) {
        throw {
          status: 400,
          data: {
            message: 'شماره موبایل وارد شده با شماره ثبت شده در سیستم تطابق ندارد'
          }
        }
      }
      if (req.body.otp) {
        result = await new UserBusinessLogic().checkUpdateOtp(inputData)
      } else {
        result = await new UserBusinessLogic().sendOtp(inputData, 'update');
      }
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

module.exports = UserController;