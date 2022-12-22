const config = require('../../../utility/initializer');

class UserRepository {
  constructor() {
  }

  async getUser(field, inputData) {
    return await config.mongoDB.collection('users').findOne({[field]: inputData}, {projection: {_id: 0}});
  }

  async addUser(inputData) {
    await config.mongoDB.collection('users').insertOne(inputData);
  }

  async updateUser(query, inputData) {
    await config.mongoDB.collection('users').updateOne(query, {$set: inputData});
    return await config.mongoDB.collection('users').findOne(query, {projection: {_id: 0}});

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

  async addToWallet(inputData) {
    await config.mongoDB.collection('wallet').insertOne(inputData);
  }


  // ----- آپدیت پروفایل
  async addUpdateOtp(inputData) {
    await config.mongoDB.collection('userUpdateOtp').updateOne({phoneNumber: inputData.phoneNumber},
      {$set: inputData}, {upsert: true});
  }

  async getUpdateUser(field, inputData) {
    return await config.mongoDB.collection('userUpdateOtp').findOne({[field]: inputData});
  }

  async updateUpdateUser(inputData) {
    await config.mongoDB.collection('userUpdateOtp').updateOne({phoneNumber: inputData.phoneNumber}, {
      $set: {status: inputData.status}
    });
  }


  async incrementServiceCounterUser(query, incrementQuery) {
    await config.mongoDB.collection('users').updateOne(query, incrementQuery)
  }

}

module.exports = UserRepository;