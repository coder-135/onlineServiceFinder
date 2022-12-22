const FactorRepository = require('../repository/factorRepository');
const moment = require("moment-jalaali");
const uuid = require('uuid');
const SocketManagement = require('../../../Socket.io/socketManagementClass');

class FactorBusinessLogic {
  constructor() {
  }

  async getAgentFactor(inputData) {
    const factors = await new FactorRepository().getAgentFactor(inputData);
    return {
      status: 'success',
      data: {
        message: "دریافت ریز تراکنش های کارگذار با موفقیت انجام شد",
        result: factors
      }
    }
  }

  async getDailyIncome(inputData) {
    let increases = 0;
    let decreases = 0;
    inputData.date = moment().format('jYYYY/jMM/jDD');
    const factors = await new FactorRepository().getAgentFactor(inputData);
    if(factors.length > 0)
    factors.forEach(item => {
      if (item.increaseStatus)
        increases += item.amount
      else
        decreases += item.amount
    })

    const dailyIncome = increases - decreases;
    return {
      status: 'success',
      data: {
        message: "دریافت درآمد روزانه با موفقیت انجام شد",
        result: dailyIncome
      }
    }
  }

}

module.exports = FactorBusinessLogic;