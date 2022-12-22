const ServiceRepository = require('../repository/serviceRepository')
const UserRepository = require('../../UserManagerService/repository/userRepository')
const AgentRepository = require('../../AgentManagerService/repository/agentRepository')
const moment = require("moment-jalaali");
const uuid = require('uuid');

class ServiceBusinessLogic {
  constructor() {
  }


  async addCancellation(inputData) {
    const service = await new ServiceRepository().getServiceDetail(inputData);

    await new ServiceRepository().addCancellation(inputData);


    return {
      status: 'success',
      data: {
        message: "عکس پروفایل با موفقیت آپلود شد",
        result: {avatarUrl: inputData.avatarUrl}
      }
    }
  }

  async historyService(inputData) {
    const services = await new ServiceRepository().getServices(inputData);
    return {
      data: {
        message: 'دریافت سرویس ها با موفقیت انجام شد',
        result: {
          services,
          count: services.length
        }
      }
    }
  }
  async singleService(inputData) {
    const service = await new ServiceRepository().getServiceDetail(inputData);
    return {
      data: {
        message: 'دریافت سرویس با موفقیت انجام شد',
        result: service
      }
    }
  }

  async getReservedServices(inputData) {
    const services = await new ServiceRepository().getAllServices(inputData);

    //todo validate reserved date and stuff

    return {
      data: {
        message: 'دریافت سرویس های رزروی با موفقیت انجام شد',
        result: {
          services,
          count: services.length
        }
      }
    }
  }

  async getVipServices(inputData) {
    let services = await new ServiceRepository().getAllServices(inputData);
    services.forEach(item => {
      delete item.operatorStatus
    })
    return {
      data: {
        message: 'دریافت سرویس های vip با موفقیت انجام شد',
        result: {
          services,
          count: services.length
        }
      }
    }
  }

  async useDiscount(inputData) {
    const discountDetail = await new ServiceRepository().getDiscountDetails(inputData);
    if (!discountDetail)
      throw{
        data: {message: 'کد تخفیف یافت نشد لطفا دوباره بررسی نمایید'}
      }
    if (discountDetail.isUsed)
      throw {
        data: {message: 'کد تخفیف استفاده شده است'}
      }

    if (moment().format('jYYYY/jMM/jDD') > discountDetail.expirationDate)
      throw {
        data: {message: 'کد تخفیف منقضی شده است'}
      }

    await new ServiceRepository().updateDiscountStatus(inputData);

    return {
      data: {
        message: 'کد تخفیف با موفقیت اعمال شد',
        result: {
          discountAmount: discountDetail.amount
        }
      }
    }
  }
}

module.exports = ServiceBusinessLogic;