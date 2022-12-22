const UserRepository = require('../repository/userRepository');
const AgentRepository = require('../../AgentManagerService/repository/agentRepository');
const CategoryRepository = require('../../GeneralInformationService/repository/generalRepository');
const config = require('../../../utility/initializer');
const axios = require('axios');
const moment = require("moment-jalaali");
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const accessManager = require('../../../utility/accessManagerService/accessManager')
const {sendSms} = require('../../../utility/smsSender');

class UserBusinessLogic {
  constructor() {
  }

  async signup(inputData) {
    const nationalIdValidation = this.validateNationalId(inputData.nationalId);
    if (!nationalIdValidation) {
      throw {
        status: 400,
        data: {
          message: ' ساختار کد ملی اشتباه است'
        }
      }
    }
    //بررسی احراز هویت کاربر بر اساس پیامک
    const initialUserData = await new UserRepository().getOtp({phoneNumber: inputData.phoneNumber});
    if (!initialUserData || initialUserData.status !== 'verified') {
      throw {
        status: 400,
        data: {
          message: 'کاربر احراز هویت نشده است'
        }
      }
    }

    //بررسی شماره موبایل کاربر که قبلا در سیستم وجود دارد یا نه
    const userData = await new UserRepository().getUser('phoneNumber', inputData.phoneNumber);
    if (userData) {
      throw  {
        status: 409,
        data: {
          message: 'شماره موبایل قبلا در سیستم ثبت شده است'
        }
      }
    }

    //هش کردن گذرواژه
    const salt = await bcrypt.genSalt(10);
    inputData.password = await bcrypt.hash(inputData.password, salt);
    inputData.userId = uuid.v4();
    const walletData = {
      id: inputData.userId,
      nationalId: inputData.nationalId,
      stock: 0
    }
    await new UserRepository().addUser(inputData);
    await new UserRepository().addToWallet(walletData);
    delete inputData.password;
    delete inputData._id;
    const accessToken = new accessManager().generateAccessToken(inputData.userId);
    const refreshToken = new accessManager().generateRefreshToken(inputData.userId);

    return {
      status: 'success',
      data: {
        message: "کاربر با موفقیت در سیستم ثبت نام شد",
        result: {
          userData: inputData,
          accessToken,
          refreshToken
        }
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
    const user = await new UserRepository().getUser('nationalId', inputData.nationalId);
    if (user) {
      const validPassword = await bcrypt.compare(inputData.password, user.password);
      if (validPassword) {
        await new UserRepository().updateUser({nationalId: inputData.nationalId}, {ip: inputData.ip});
        const accessToken = new accessManager().generateAccessToken(user.userId);
        const refreshToken = new accessManager().generateRefreshToken(user.userId);
        return {
          status: 'success',
          data: {
            message: "کاربر گرامی به پلتفرم هایو خوش آمدید",
            result: {
              userData: user,
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
      throw  {
        status: 400,
        data: {
          message: 'کد ملی یا رمز عبور اشتباه است'
        }
      }
    }
  }

  async sendOtp(inputData, mode) {
    //todo check nationalId if it belongs to phoneNumber
    inputData.otp = this.generateOtp();
    const smsData = {
      phoneNumber: inputData.phoneNumber,
      otp: inputData.otp,
      pattern: 'otp'
    }
    const smsResult = await sendSms(smsData)
    if (smsResult.status === 200) {
      inputData.status = 'pending';
      inputData.expireTime = +moment().add(2, 'minute').format('HHmm');
      if (mode === 'signup')
        await new UserRepository().addOtp(inputData);
      else if (mode === 'update')
        await new UserRepository().addUpdateOtp(inputData)
      else
        await new UserRepository().addResetOtp(inputData)
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
    const user = mode === 'signup' ? await new UserRepository().getOtp(inputData) :
      await new UserRepository().getResetOtp("phoneNumber", inputData.phoneNumber);

    if (!(user.otp === inputData.otp)) {
      throw{
        status: 400,
        data: {
          message: 'کد یکبار مصرف ارسال شده معتبر نمی باشد'
        }
      }
    }

    if (user.expireTime <= now) throw {
      status: 400,
      data: {
        message: "کد  یکبار مصرف منقضی شده است"
      }
    }
    inputData.status = 'verified';
    if (mode === 'signup')
      await new UserRepository().updateOtp(inputData);
    else
      await new UserRepository().updateResetOtp(inputData);

    return {
      status: 'success',
      data: {
        message: 'کاربر با موفقیت احراز هویت شد',
      }
    }
  }

  async resetPassword(inputData) {
    //بررسی احراز هویت کاربر بر اساس پیامک
    const initialUserData = await new UserRepository().getResetOtp("nationalId", inputData.nationalId);
    if (!initialUserData || initialUserData.status !== 'verified') {
      throw {
        status: 400,
        data: {
          message: 'کاربر احراز هویت نشده است'
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    inputData.password = await bcrypt.hash(inputData.password, salt);
    await new UserRepository().updateUser({nationalId: inputData.nationalId}, inputData);
    return {
      status: 'success',
      data: {
        message: "رمز عبور با موفقیت تغییر کرد",
      }
    }
  }

  async addVIP(inputData) {

    const agentData = await new AgentRepository().getAgent('agentId', inputData.agentId);
    if (!agentData) {
      throw {
        data: {
          status: 404,
          message: 'کارگزار مورد نظر یافت نشد'
        }
      }
    }
    let userData = await new UserRepository().getUser('userId', inputData.userId);
    let VIPs = userData.VIP;
    VIPs.push(agentData.agentId);

    inputData = {
      nationalId: userData.nationalId,
      VIP: VIPs
    }

    await new UserRepository().updateUser({nationalId: inputData.nationalId}, inputData);
    return {
      status: 'success',
      data: {
        message: "کارگذار مد نظر به لیست VIP افزوده شد",
      }
    }
  }

  async getVIP(inputData) {

    let agents = []
    const userData = await new UserRepository().getUser('userId', inputData.userId);
    if (!userData)
      throw {
        status: 404,
        data: {message: 'کاربر وجود ندارد'}
      }

    for (let i = 0; i < userData.VIP.length; i++) {
      let agent = await new AgentRepository().getAgent('agentId', userData.VIP[i]);
      let category = agent.categoryIds.map(item => {
        let category = config.categories.find(item2 => item2.id === item)
        return {
          categoryName: category.name,
          categoryId: category.id
        }
      })
      agents.push({
        agentId: agent.agentId,
        fullName: agent.fullName,
        avatarUrl: agent.avatarUrl,
        category
      })
    }

    return {
      status: 'success',
      data: {
        message: "لیست کارگذاران VIP ",
        result: agents
      }
    }
  }

  async updateUser(inputData) {

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
    const initialUserData = await new UserRepository().getUpdateUser({phoneNumber: inputData.phoneNumber});
    if (!initialUserData || initialUserData.status !== 'verified') {
      throw {
        status: 400,
        data: {
          message: 'کاربر احراز هویت نشده است'
        }
      }
    }

    inputData = await new UserRepository().updateUser({userId: inputData.userId}, inputData);

    return {
      status: 'success',
      data: {
        message: "اطلاعات پروفایلی کاربر با موفقیت آپدیت شد",
        result: inputData
      }
    }
  }

  async checkUpdateOtp(inputData) {
    const now = +moment().format('HHmm');
    const user = await new UserRepository().getUpdateUser("phoneNumber", inputData.phoneNumber);
    if (!(user.otp === inputData.otp)) {
      throw {
        status: 400,
        data: {
          message: 'کد یکبار مصرف ارسال شده معتبر نمی باشد'
        }
      }
    }

    if (user.expireTime < now) throw {
      status: 400,
      data: {
        message: "کد  یکبار مصرف منقضی شده است"
      }
    }
    inputData.status = 'verified';

    await new UserRepository().updateUpdateUser(inputData);

    return {
      status: 'success',
      data: {
        message: 'کاربر با موفقیت احراز هویت شد',
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

module.exports = UserBusinessLogic;