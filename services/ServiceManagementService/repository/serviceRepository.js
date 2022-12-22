const config = require('../../../utility/initializer');

class ServiceRepository {
  constructor() {
  }

  async getServiceDetail(inputData) {
    return await config.mongoDB.collection('services').findOne(inputData, {projection: {_id: 0}});
  }

  async getServices(inputData) {
    return await config.mongoDB.collection('services').find(inputData, {
      projection: {
        _id: 0,
        categoryName: 1,
        serviceCode: 1
      }
    }).toArray();
  }

  async getAllServices(inputData) {
    return await config.mongoDB.collection('services').find(inputData, {
      projection: {
        _id: 0,
      }
    }).toArray();
  }

  //discount queries

  async getDiscountDetails(inputData) {
    return await config.mongoDB.collection('discounts').findOne(inputData, {projection: {_id: 0}});
  }

  async updateDiscountStatus(inputData) {
    await config.mongoDB.collection('discounts').updateOne(inputData, {
      $set: {isUsed: true}
    })
  }
}

module.exports = ServiceRepository;