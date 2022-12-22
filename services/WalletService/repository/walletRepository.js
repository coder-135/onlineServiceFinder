const config = require('../../../utility/initializer');

class WalletRepository {
  constructor() {
  }

  async getStock(inputData) {
    return await config.mongoDB.collection('wallet').findOne(inputData, {projection: {_id: 0}});
  }

  async getAllStock() {
    return await config.mongoDB.collection('wallet').find({}, {projection: {_id: 0}}).toArray();
  }

  async updateStock(inputData) {
    return await config.mongoDB.collection('wallet').updateOne({id: inputData.id}, {
      $set: inputData
    });
  }

  async incrementStock(inputData) {
    await config.mongoDB.collection('wallet').updateOne({id: inputData.id}, {$inc: {stock: inputData.stock}})
  }

  async addDepositRequest(inputData) {
    await config.mongoDB.collection('deposits').insertOne(inputData);
  }

  async addIBAN(inputData) {
    const result = await config.mongoDB.collection('IBAN').findOne({agentId: inputData.agentId}, {projection: {_id: 0}});
    if (result) {
      throw {
        status: 409,
        data: {
          message: 'شماره شبا شما قبلا در سیستم ثبت شده است',
          result
        }
      }
    }
    await config.mongoDB.collection('IBAN').insertOne(inputData);
  }

  async getIBAN(inputData) {
   return  await config.mongoDB.collection('IBAN').findOne(inputData, {projection: {_id: 0}});
  }

  async updateIBAN(inputData) {
    await config.mongoDB.collection('IBAN').updateOne({agentId: inputData.agentId}, {
      $set: inputData
    });
    return await config.mongoDB.collection('IBAN').findOne({agentId: inputData.agentId}, {projection: {_id: 0}});
  }

  async addFactor(inputData) {
    await config.mongoDB.collection('factors').insertOne(inputData);
  }
}

module.exports = WalletRepository;