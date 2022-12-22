const PaymentRepository = require('../repository/paymentRepository');
const WalletRepository = require('../../WalletService/repository/walletRepository');
const FactorRepository = require('../../FactorService/repository/factorRepository');
const AgentRepository = require('../../AgentManagerService/repository/agentRepository');
const UserRepository = require('../../UserManagerService/repository/userRepository');
const crypto = require('crypto');
const axios = require('axios');
const moment = require("moment-jalaali");
const uuid = require('uuid');
const accessManager = require('../../../utility/accessManagerService/accessManager');
const terminalId = process.env.TERMINAL_ID;
const merchantId = process.env.MERCHANT_ID;
const terminalkey = process.env.TERMINAL_KEY;
const returnUrl = 'https://hive1400.ir/api/payment/verify'

class PaymentBusinessLogic {
  constructor() {
  }

  async paymentRequest(inputData) {
    const orderId = Date.now() + Math.floor(Math.random() * 100) + 1;
    const dateTime = moment().format('YYYY/MM/DD HH:mm:ss');
    const signData = this.encryptPkcs7(`${terminalId};${orderId};${inputData.amount}`, terminalkey);
    const requestBankUrl = 'https://sadad.shaparak.ir/vpg/api/v0/Request/PaymentRequest';
    const data = {
      TerminalId: terminalId,
      MerchantId: merchantId,
      Amount: inputData.amount,
      SignData: signData,
      ReturnUrl: returnUrl,
      LocalDateTime: dateTime,
      OrderId: orderId
    }

    const result = await axios.post(requestBankUrl, data, {
      headers: {
        'Content-Length': JSON.stringify(data).length,
        'Content-Type': 'application/json',
      }
    });
    if (result.data.ResCode === "0") {
      let requestData = {
        token: result.data.Token,
        category: inputData.category,
        amount: inputData.amount,
        phoneNumber: inputData.phoneNumber,
        additionalData: inputData.additionalData,
        orderId,
        id: uuid.v4(),
        dateTime,
        status: false
      }
      await new PaymentRepository().addPaymentRequest(requestData);
      return {
        status: 'success',
        data: {
          message: result.data.Description,
          result: {
            redirectURL: `https://sadad.shaparak.ir/VPG/Purchase?Token=${result.data.Token}`,
            token: result.data.Token
          }
        }
      }
    } else {
      throw {
        data: {
          message: result.data.Description,
          ResCode: result.data.ResCode
        }
      }
    }
  }

  async verifyPayment(inputData) {

    const verifyUrl = 'https://sadad.shaparak.ir/vpg/api/v0/Advice/Verify';
    const transactionData = await new PaymentRepository().getPaymentRequest({token: inputData.token});
    let retryData = {
      amount: transactionData.amount,
      phoneNumber: transactionData.phoneNumber,
      category: transactionData.category,
      nationalId: transactionData.additionalData.nationalId,
      description: transactionData.additionalData.description,
    }
    if (transactionData.category === 'wallet') {
      retryData.id = transactionData.additionalData.id
    }
    if (inputData.ResCode.toString() === '0') {
      const verifyData = {
        Token: inputData.token,
        SignData: this.encryptPkcs7(inputData.token, terminalkey),
      };

      const result = await axios.post(verifyUrl, verifyData, {
        headers: {
          'Content-Length': JSON.stringify(verifyData).length,
          'Content-Type': 'application/json',
        }
      });
      if (result.data.ResCode.toString() === '0') {
        if (transactionData.category === 'agentSignup') {
          const agentData = {
            nationalId: transactionData.additionalData.nationalId,
            paymentStatus: true
          }
          const updateTransactionData = {
            token: inputData.token,
            trackingNumber: result.data.RetrivalRefNo,
            dateTime: moment().format('YYYY/MM/DD HH:mm:ss'),
            status: true
          }
          const hiveFactor = {
            factorTitle: 'جهت ثبت نام و احراز هویت کارگذار',
            factorType: 'bank',
            trackingNumber: result.data.RetrivalRefNo,
            increaseStatus: true,
            ownerId: 'hive',
            serviceCode: null,
            factorId: uuid.v4(),
            amount: transactionData.amount,
            date: moment().format('jYYYYjMMjDD'),
            time: moment().format('HH:mm:ss')
          }
          await new AgentRepository().updateAgent(agentData);
          await new PaymentRepository().updatePaymentRequest(updateTransactionData);
          await new FactorRepository().addFactor(hiveFactor);

          return {
            trackingNumber: result.data.RetrivalRefNo,
            orderId: transactionData.orderId,
            message: 'پرداخت با موفقیت انجام شده است'
          }
        }
        if (transactionData.category === 'wallet') {
          const updateTransactionData = {
            token: inputData.token,
            trackingNumber: result.data.RetrivalRefNo,
            dateTime: moment().format('YYYY/MM/DD HH:mm:ss'),
            status: true
          }
          const walletData = {
            id: transactionData.additionalData.id,
            stock: transactionData.amount
          }
          const factorData = {
            factorTitle: 'افزایش اعتبار کیف پول',
            increaseStatus: true,
            factorType: 'bank',
            trackingNumber: result.data.RetrivalRefNo,
            ownerId: transactionData.additionalData.id,
            factorId: uuid.v4(),
            amount: transactionData.amount,
            date: moment().format('jYYYYjMMjDD'),
            time: moment().format('HH:mm:ss')
          }
          await new PaymentRepository().updatePaymentRequest(updateTransactionData);
          await new WalletRepository().incrementStock(walletData);
          await new PaymentRepository().addFactor(factorData);
          return {
            trackingNumber: result.data.RetrivalRefNo,
            orderId: transactionData.orderId,
            message: 'شارژ کیف پول با موفقیت انجام شد'
          }
        }
      } else {
        throw {
          message: 'تراکنش نا موفق بود در صورت کسر مبلغ از حساب شما حداکثر پس از 72 ساعت مبلغ به حسابتان برمی گردد.',
          inputData: retryData
        }
      }
    } else {
      throw {
        message: 'تراکنش ناموفق',
        inputData: retryData
      }
    }
  }

  async checkPayment(inputData) {
    const transaction = await new PaymentRepository().getPaymentRequest(inputData);
    if (transaction.status) {
      return {
        data: {
          message: 'پرداخت با موفقیت انجام شده است',
          result: {
            status: true,
            trackingNumber: transaction.trackingNumber,
            orderId: transaction.orderId,
            token:null,
            redirectUrl:null
          }
        }
      }
    } else {
      if (transaction.category === 'agentSignup') {
        const requestPaymentData = {
          amount: transaction.amount,
          phoneNumber: transaction.phoneNumber,
          category: transaction.category,
          nationalId: transaction.additionalData.nationalId,
          description: transaction.additionalData.description
        }
        const result = await axios.post('https://hive1400.ir/api/payment/request', requestPaymentData);
        const redirectUrl = result.data.data.result.redirectURL;
        const token = result.data.data.result.token;
        return {
          data: {
            message: 'پرداخت ناموفق بود برای تلاش مجدد اقدام نمایید',
            result: {
              status: false,
              trackingNumber: null,
              orderId: null,
              token,
              redirectUrl
            }
          }
        }
      } else {
        const requestPaymentData = {
          amount: transaction.amount,
          phoneNumber: transaction.phoneNumber,
          category: transaction.category,
          nationalId: transaction.additionalData.nationalId,
          id: transaction.additionalData.id,
          description: transaction.additionalData.description
        }
        const result = await axios.post('https://hive1400.ir/api/payment/request', requestPaymentData);
        const redirectUrl = result.data.data.result.redirectURL;
        const token = result.data.data.result.token;
        return {
          data: {
            message: 'پرداخت ناموفق بود برای تلاش مجدد اقدام نمایید',
            result: {
              status: false,
              trackingNumber: null,
              orderId: null,
              token,
              redirectUrl
            }
          }
        }
      }
    }
  }

  encryptPkcs7(data, key) {
    key = Buffer.from(key, 'base64');
    const cipher = crypto.createCipheriv("des-ede3", key, null);
    return cipher.update(data, "utf8", "base64") + cipher.final("base64");
  }

}

module.exports = PaymentBusinessLogic;