const config = require('../../../utility/initializer');

class SurveyRepository {
  constructor() {
  }

  async addAgentSurvey(inputData) {
    await config.mongoDB.collection('surveys').insertOne(inputData);
  }

  async getServiceDetail(inputData) {
    inputData = await config.redis.hget('services', inputData.serviceCode);
    return JSON.parse(inputData);
  }
}

module.exports = SurveyRepository;