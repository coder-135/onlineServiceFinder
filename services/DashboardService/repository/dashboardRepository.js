const config = require('../../../utility/initializer');

class DashboardRepository {
  constructor() {
  }

  async getUser(field, inputData) {
    return await config.mongoDB.collection('users').findOne({[field]: inputData}, {projection: {_id: 0}});
  }

  async addUser(inputData) {
    await config.mongoDB.collection('users').insertOne(inputData);
  }

  async updateUser(inputData) {
    await config.mongoDB.collection('users').updateOne({nationalId: inputData.nationalId}, {$set: inputData});
  }

  async addOtp(inputData) {
    await config.mongoDB.collection('userOtp').updateOne({phoneNumber: inputData.phoneNumber},
      {$set: inputData}, {upsert: true});
  }

  async addResetOtp(inputData) {
    await config.mongoDB.collection('userResetOtp').updateOne({phoneNumber: inputData.phoneNumber},
      {$set: inputData}, {upsert: true});
  }

  async getOtp(inputData) {
    return await config.mongoDB.collection('userOtp').findOne({phoneNumber: inputData.phoneNumber});
  }

  async getResetOtp(field, inputData) {
    return await config.mongoDB.collection('userResetOtp').findOne({[field]: inputData});
  }

  async updateOtp(inputData) {
    return await config.mongoDB.collection('userOtp').updateOne({phoneNumber: inputData.phoneNumber}, {
      $set: {status: inputData.status}
    });
  }

  async updateResetOtp(inputData) {
    return await config.mongoDB.collection('userResetOtp').updateOne({phoneNumber: inputData.phoneNumber}, {
      $set: {status: inputData.status}
    });
  }

}

module.exports = DashboardRepository;