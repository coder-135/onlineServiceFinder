const config = require('../../../utility/initializer');

class FactorRepository {
  constructor() {
  }

  async getAgentFactor(inputData) {
   return  await config.mongoDB.collection('factors').find(inputData, {projection: {_id: 0}}).toArray();
  }

  async addFactor(inputData) {
    await config.mongoDB.collection('factors').insertOne(inputData);
  }

  async addManyFactors(inputData) {
    await config.mongoDB.collection('factors').insertMany(inputData);
  }
}

module.exports = FactorRepository;