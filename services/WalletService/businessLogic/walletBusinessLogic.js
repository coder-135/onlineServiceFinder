const WalletRepository = require('../repository/walletRepository');
const moment = require("moment-jalaali");
const uuid = require('uuid');
const SocketManagement = require('../../../Socket.io/socketManagementClass');

class WalletBusinessLogic {
  constructor() {
  }

  async getStock(inputData) {
    const stock = await new WalletRepository().getStock(inputData);
    return {
      status: 'success',
      data: {
        message: "دریافت موجودی با موفقیت انجام شد",
        result: stock
      }
    }
  }

  async withdrawal(inputData) {
    const stockDetail = await new WalletRepository().getStock(inputData);
    if (stockDetail.stock <= 300000) {
      return {
        status: 'success',
        data: {
          message: 'موجودی شما کمتر از 30 هزار تومان است ، امکان برداشت وجه ندارد درصورت راهنمایی لطفا با پشتیبانی تماس حاصل فرمایید'
        }
      }
    }
    inputData.stock = 300000;
    //todo add withdrawal factor
    const depositData = {
      deposit: stockDetail.stock - 300000,
      agentId: inputData.id,
      id: uuid.v4(),
      requestDate: moment().format('jYYYYjMMjDD'),
      requestTime: moment().format('HH:mm:ss'),
      depositDate: null,
      depositTime: null,
      status: false
    }

    await new WalletRepository().updateStock(inputData);
    await new WalletRepository().addDepositRequest(depositData);
    delete depositData._id;
    return {
      status: 'success',
      data: {
        message: "درخواست برداشت وجه با موفقیت انجام شد و پس از 24 ساعت کاری به حساب شما واریز خواهد شد",
        result: depositData
      }
    }
  }

  async addIBAN(inputData) {
    await new WalletRepository().addIBAN(inputData);
    delete inputData._id;
    return {
      status: 'success',
      data: {
        message: "شماره شبا ثبت شد پس از تایید اپراتور هایو در سامانه ثبت می شود",
        result: inputData
      }
    }
  }

  async getIBAN(inputData) {
    inputData = await new WalletRepository().getIBAN(inputData);
    return {
      status: 'success',
      data: {
        message: "دریافت اطلاعات حساب بانکی با موفقیت انجام شد",
        result: inputData
      }
    }
  }

  async updateIBAN(inputData) {
    inputData = await new WalletRepository().updateIBAN(inputData);
    return {
      status: 'success',
      data: {
        message: "ویرایش اطلاعات حساب بانکی با موفقیت انجام شد",
        result: inputData
      }
    }
  }


}

module.exports = WalletBusinessLogic;