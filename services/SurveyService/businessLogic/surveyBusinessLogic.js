const SurveyRepository = require('../repository/surveyRepository');
const ServiceRepository = require('../../ServiceManagementService/repository/serviceRepository');
const UserRepository = require('../../UserManagerService/repository/userRepository')
const AgentRepository = require('../../AgentManagerService/repository/agentRepository')
const moment = require("moment-jalaali");
const uuid = require('uuid');

class SurveyBusinessLogic {
  constructor() {
  }


  async addAgentSurvey(inputData) {
    let service = await new ServiceRepository().getServiceDetail({serviceCode: inputData.serviceCode});

    // if(service.state !== 4 ) {
    //   throw {
    //     status : 400,
    //     data: {
    //       message: 'سرویس هنوز به پایان نرسیده است شما نمی توانید در نظر سنجی شرکت کنید'
    //     }
    //   }
    // }
    inputData.userId = service.userId;
    inputData.agentId = service.agentId;
    await new SurveyRepository().addAgentSurvey(inputData);
    if (inputData.type === 'user') {
      let agentData = await new AgentRepository().getAgent('agentId', inputData.agentId);
      const agentDataRate = {
        nationalId: agentData.nationalId,
        totalRates: agentData.totalRates + inputData.rate,
        raterCount: agentData.raterCount + 1,
        rate: (agentData.totalRates + inputData.rate) / (agentData.raterCount + 1)
      }
      await new AgentRepository().updateAgent({nationalId: agentData.nationalId}, agentDataRate);
    } else {
      let userData = await new UserRepository().getUser('userId', inputData.userId);
      const userDataRate = {
        nationalId: userData.nationalId,
        totalRates: userData.totalRates + inputData.rate,
        raterCount: userData.raterCount + 1,
        rate: (userData.totalRates + inputData.rate) / (userData.raterCount + 1)
      }
      await new UserRepository().updateUser({nationalId: userDataRate.nationalId},userDataRate);
    }
    delete inputData._id;
    return {
      status: 'success',
      data: {
        message: "ثبت نظر سنجی با موفقیت انجام شد",
        result: inputData
      }
    }
  }


}

module.exports = SurveyBusinessLogic;