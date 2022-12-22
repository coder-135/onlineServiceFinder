const AgentRepository = require('../repository/agentRepository')
const axios = require('axios');
const moment = require("moment-jalaali");
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const accessManager = require('../../../utility/accessManagerService/accessManager')
const {sendSms} = require("../../../utility/smsSender");

class AgentBusinessLogic {
  constructor() {
  }

  async signup(inputData) {

    const nationaIdValidation = this.validateNationalId(inputData.nationalId);
    if (!nationaIdValidation) {
      throw {
        status: 400,
        data: {
          message: 'ساختار کد ملی اشتباه است'
        }
      }
    }
    //بررسی احراز هویت کاربر بر اساس پیامک
    const initialAgentData = await new AgentRepository().getOtp({phoneNumber: inputData.phoneNumber});
    if (!initialAgentData || initialAgentData.status !== 'verified') {
      throw {
        status: 400,
        data: {
          message: 'کارگذار احراز هویت نشده است'
        }
      }
    }

    //بررسی شماره موبایل کاربر که قبلا در سیستم وجود دارد یا نه
    const agentData = await new AgentRepository().getAgent('phoneNumber', inputData.phoneNumber);
    if (agentData) {
      throw  {
        status: 409,
        data: {
          message: 'شماره موبایل قبلا در سیستم ثبت شده است '
        }
      }
    }

    //هش کردن گذرواژه
    const salt = await bcrypt.genSalt(10);
    inputData.password = await bcrypt.hash(inputData.password, salt);
    inputData.agentId = uuid.v4();
    const walletData = {
      id: inputData.agentId,
      nationalId: inputData.nationalId,
      stock: 0
    }
    await new AgentRepository().addAgent(inputData);
    await new AgentRepository().addToWallet(walletData);
    delete inputData._id;
    return {
      status: 'success',
      data: {
        message: "ثبت نام اولیه انجام شد، جهت فعال سازی لطفا برای پرداخت اقدام نمایید",
        result: {
          userData: inputData,
          paymentAPI: 'https:/hive1400.ir/api/payment/request'
        }
      }
    }
  }

  async updateAgent(inputData) {

    if (inputData.nationalId) {
      const nationaIdValidation = this.validateNationalId(inputData.nationalId);
      if (!nationaIdValidation) {
        throw {
          status: 400,
          data: {
            message: 'ساختار کد ملی اشتباه است'
          }
        }
      }
    }

    //بررسی احراز هویت کاربر بر اساس پیامک
    const initialAgentData = await new AgentRepository().getUpdateAgent({phoneNumber: inputData.phoneNumber});
    if (!initialAgentData || initialAgentData.status !== 'verified') {
      throw {
        status: 400,
        data: {
          message: 'کارگذار احراز هویت نشده است'
        }
      }
    }

    inputData =  await new AgentRepository().updateAgent({agentId: inputData.agentId}, inputData);

    delete inputData._id;
    return {
      status: 'success',
      data: {
        message: "اطلاعات پروفایلی کارگذار با موفقیت آپدیت شد",
        result: inputData
      }
    }
  }

  async login(inputData) {
    const nationaIdValidation = this.validateNationalId(inputData.nationalId);
    if (!nationaIdValidation) {
      throw {
        status: 400,
        data: {
          message: 'ساختار کد ملی اشتباه است'
        }
      }
    }
    const agent = await new AgentRepository().getAgent('nationalId', inputData.nationalId);
    if (agent) {
      if (agent.paymentStatus) {
        if (agent.status) {
          const validPassword = await bcrypt.compare(inputData.password, agent.password);
          if (validPassword) {
            await new AgentRepository().updateAgent({nationalId: inputData.nationalId}, {ip: inputData.ip});
            const accessToken = new accessManager().generateAccessToken(agent.agentId);
            const refreshToken = new accessManager().generateRefreshToken(agent.agentId);
            return {
              status: 'success',
              data: {
                message: "کارگذار گرامی به پلتفرم هایو خوش آمدید",
                result: {
                  userData: agent,
                  accessToken,
                  refreshToken
                }
              }
            }
          } else {
            throw  {
              status: 400,
              data: {
                message: 'کد ملی یا رمز عبور اشتباه است'
              }
            }
          }
        } else {
          throw {
            status: 403,
            data: {
              message: 'کارگذار گرامی وضعیت شما هنوز در دست بررسی می باشد، پس از تایید وضعیت نتیجه را از طریق پیامک به اطلاع شما می رسانیم'
            }
          }
        }

      } else {
        const requestPaymentData = {
          amount: 10000,
          phoneNumber: agent.phoneNumber,
          category: "agentSignup",
          nationalId: agent.nationalId,
          description: "مبلغ 15 هزار تومن جهت احراز هویت"
        }
        const result = await axios.post('https://hive1400.ir/api/payment/request', requestPaymentData);
        const redirectUrl = result.data.data.result.redirectURL;
        const token = result.data.data.result.token;
        throw {
          status: 402,
          data: {
            message: 'کارگذار احراز هویت نشده است، لطفا جهت فعال سازی مبلغ احراز هویت را پرداخت نمایید',
            redirectUrl,
            token
          }
        }
      }
    } else {
      throw  {
        status: 400,
        data: {
          message: 'کد ملی یا رمز عبور اشتباه است'
        }
      }
    }
  }

  async sendOtp(inputData, mode) {
    inputData.otp = this.generateOtp();
    const smsData = {
      phoneNumber: inputData.phoneNumber,
      otp: inputData.otp,
      pattern: 'otp'
    }
    const smsResult = await sendSms(smsData)
    if (smsResult.status === 200) {
      inputData.status = 'pending';
      inputData.expireTime = +moment().add(3, 'minute').format('HHmm');
      if (mode === 'signup')
        await new AgentRepository().addOtp(inputData);
      else if (mode === 'update')
        await new AgentRepository().addUpdateOtp(inputData);
      else
        await new AgentRepository().addResetOtp(inputData);
      return {
        status: 'success',
        data: {
          message: 'پیامک با موفقیت ارسال شد',
        }
      }
    } else {
      throw {
        status: 400,
        data: {
          message: 'خطا در ارسال پیامک لطفا دوباره تلاش کنید'
        }
      }
    }
  }

  async checkOtp(inputData, mode) {
    const now = +moment().format('HHmm');
    const agent = mode === 'signup' ? await new AgentRepository().getOtp(inputData) :
      await new AgentRepository().getResetOtp("phoneNumber", inputData.phoneNumber);

    if (!(agent.otp === inputData.otp)) {
      throw {
        status: 400,
        data: {
          message: 'کد یکبار مصرف ارسال شده معتبر نمی باشد'
        }
      }
    }

    if (agent.expireTime <= now) throw {
      status: 400,
      data: {
        message: "کد  یکبار مصرف منقضی شده است"
      }
    }
    inputData.status = 'verified';
    if (mode === 'signup')
      await new AgentRepository().updateOtp(inputData);
    else
      await new AgentRepository().updateResetOtp(inputData);

    return {
      status: 'success',
      data: {
        message: 'کارگذار با موفقیت احراز هویت شد',
      }
    }
  }

  async checkUpdateOtp(inputData) {
    const now = +moment().format('HHmm');
    const agent = await new AgentRepository().getUpdateAgent("phoneNumber", inputData.phoneNumber);
    if (!(agent.otp === inputData.otp)) {
      throw {
        status: 400,
        data: {
          message: 'کد یکبار مصرف ارسال شده معتبر نمی باشد'
        }
      }
    }

    if (agent.expireTime <= now) throw {
      status: 400,
      data: {
        message: "کد  یکبار مصرف منقضی شده است"
      }
    }
    inputData.status = 'verified';

    await new AgentRepository().updateUpdateAgent(inputData);

    return {
      status: 'success',
      data: {
        message: 'کارگذار با موفقیت احراز هویت شد',
      }
    }
  }

  async resetPassword(inputData) {
    //بررسی احراز هویت کاربر بر اساس پیامک
    const initialAgentData = await new AgentRepository().getResetOtp("nationalId", inputData.nationalId);
    if (!initialAgentData || initialAgentData.status !== 'verified') {
      throw {
        status: 400,
        data: {
          message: 'کاربر احراز هویت نشده است'
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    inputData.password = await bcrypt.hash(inputData.password, salt);
    await new AgentRepository().updateAgent({nationalId: inputData.nationalId}, inputData);
    return {
      status: 'success',
      data: {
        message: "رمز عبور با موفقیت تغییر کرد",
      }
    }
  }

  async checkPaymentStatus(nationalId) {
    const agentData = await new AgentRepository().getAgent('nationalId', nationalId);
    if (agentData.paymentStatus) {
      return {
        status: 'success',
        data: {
          message: 'پرداخت با موفقیت انجام شده است'
        }
      }
    } else {
      throw {
        status: 400,
        data: {
          message: 'پرداخت انجام نشده است'
        }
      }
    }
  }

  generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  validateNationalId(nationalId) {
    let L = nationalId.length;
    if (L < 8 || parseInt(nationalId, 10) === 0) return false;
    nationalId = ('0000' + nationalId).substr(L + 4 - 10);
    if (parseInt(nationalId.substr(3, 6), 10) === 0) return false;
    let c = parseInt(nationalId.substr(9, 1), 10);
    let s = 0;
    for (let i = 0; i < 9; i++)
      s += parseInt(nationalId.substr(i, 1), 10) * (10 - i);
    s = s % 11;
    return (s < 2 && c === s) || (s >= 2 && c === (11 - s));
  }
}

module.exports = AgentBusinessLogic;