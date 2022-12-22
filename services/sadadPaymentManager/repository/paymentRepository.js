const config = require('../../../utility/initializer');

class PaymentRepository {
  constructor() {
  }

  async addPaymentRequest(inputData) {
    await config.mongoDB.collection('transactions').insertOne(inputData);
  }

  async getPaymentRequest(inputData) {
    return await config.mongoDB.collection('transactions').findOne({token: inputData.token});
  }

  async updatePaymentRequest(inputData) {
    await config.mongoDB.collection('transactions').updateOne({token: inputData.token}, {
      $set: inputData
    })
  };



  async addFactor(inputData) {
    await config.mongoDB.collection('factors').insertOne(inputData);
  }

}

module.exports = PaymentRepository;