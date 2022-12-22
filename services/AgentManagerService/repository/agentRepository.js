const config = require('../../../utility/initializer');

class AgentRepository {
  constructor() {
  }

  async getAgent(field, inputData) {
    return await config.mongoDB.collection('agents').findOne({[field]: inputData}, {projection: {_id: 0}});
  }

  async addAgent(inputData) {
    await config.mongoDB.collection('agents').insertOne(inputData);
  }

  async updateAgent(query, inputData) {
    await config.mongoDB.collection('agents').updateOne(query, {$set: inputData});
    return await config.mongoDB.collection('agents').findOne(query, {projection: {_id: 0}})
  }

  async addOtp(inputData) {
    await config.mongoDB.collection('agentOtp').updateOne({phoneNumber: inputData.phoneNumber},
      {$set: inputData}, {upsert: true});
  }

  async addResetOtp(inputData) {
    await config.mongoDB.collection('agentResetOtp').updateOne({phoneNumber: inputData.phoneNumber},
      {$set: inputData}, {upsert: true});
  }


  // ----- آپدیت پروفایل
  async addUpdateOtp(inputData) {
    await config.mongoDB.collection('agentUpdateOtp').updateOne({phoneNumber: inputData.phoneNumber},
      {$set: inputData}, {upsert: true});
  }

  async getUpdateAgent(field, inputData) {
    return await config.mongoDB.collection('agentUpdateOtp').findOne({[field]: inputData});
  }

  async updateUpdateAgent(inputData) {
    await config.mongoDB.collection('agentUpdateOtp').updateOne({phoneNumber: inputData.phoneNumber}, {
      $set: {status: inputData.status}
    });
  }

  async incrementServiceCounterAgent(query, incrementQuery) {
    await config.mongoDB.collection('agents').updateOne(query, incrementQuery)
  }

  async getOtp(inputData) {
    return await config.mongoDB.collection('agentOtp').findOne({phoneNumber: inputData.phoneNumber});
  }

  async getResetOtp(field, inputData) {
    return await config.mongoDB.collection('agentResetOtp').findOne({[field]: inputData});
  }


  async updateOtp(inputData) {
    return await config.mongoDB.collection('agentOtp').updateOne({phoneNumber: inputData.phoneNumber}, {
      $set: {status: inputData.status}
    });
  }

  async updateResetOtp(inputData) {
    return await config.mongoDB.collection('agentResetOtp').updateOne({phoneNumber: inputData.phoneNumber}, {
      $set: {status: inputData.status}
    });
  }

  async addToWallet(inputData) {
    await config.mongoDB.collection('wallet').insertOne(inputData);
  }

}

module.exports = AgentRepository;