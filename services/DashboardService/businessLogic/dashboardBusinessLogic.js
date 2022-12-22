const DashboardRepository = require('../repository/dashboardRepository')
const UserRepository = require('../../UserManagerService/repository/userRepository')
const AgentRepository = require('../../AgentManagerService/repository/agentRepository')
const moment = require("moment-jalaali");
const uuid = require('uuid');

class DashboardBusinessLogic {
  constructor() {
  }


  async uploadAvatar(inputData) {
    if (inputData.role === 'user')
      await new UserRepository().updateUser({nationalId: inputData.nationalId}, inputData);
    else
      await new AgentRepository().updateAgent({nationalId: inputData.nationalId}, inputData);

    return {
      status: 'success',
      data: {
        message: "عکس پروفایل با موفقیت آپلود شد",
        result: {avatarUrl: inputData.avatarUrl}
      }
    }
  }

  async deleteAvatar(inputData) {
    inputData.avatarUrl = 'https://hive1400.ir/uploads/avatars/880bcef8-2037-4890-8dbe-730d903e6f00.jpg';
    if (inputData.role === 'user')
      await new UserRepository().updateUser({nationalId: inputData.nationalId}, inputData);
    else
      await new AgentRepository().updateAgent({nationalId: inputData.nationalId}, inputData);

    return {
      status: 'success',
      data: {
        message: "عکس پروفایل با موفقیت حذف شد"
      }
    }
  }


}

module.exports = DashboardBusinessLogic;