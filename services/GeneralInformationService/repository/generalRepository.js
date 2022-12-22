const config = require('../../../utility/initializer');

class GeneralRepository {
  constructor() {
  }

  async getAllCategories() {
    return await config.mongoDB.collection('categories').find({type: 1}, {projection: {_id: 0}}).toArray();
  }

  async getSubCategories(inputData) {
    return await config.mongoDB.collection('categories').find(inputData, {projection: {_id: 0}}).toArray();
  }

  async getCategory(inputData) {
    return await config.mongoDB.collection('categories').find(inputData, {projection: {_id: 0}}).toArray();
  }

  async getRules() {
    return await config.mongoDB.collection('rules').findOne({}, {projection: {_id: 0}});
  }

  async getSkills() {
    return await config.mongoDB.collection('skills').find({}, {projection: {_id: 0}}).toArray();
  }

  async getAboutUs() {
    return await config.mongoDB.collection('about').find({}, {projection: {_id: 0}}).toArray();
  }

  async getContactUs() {
    return await config.mongoDB.collection('contact').find({}, {projection: {_id: 0}}).toArray();
  }

  async getPrizes() {
    return await config.mongoDB.collection('prizes').find({}, {projection: {_id: 0}}).toArray();
  }

  async getPrize(inputData) {
    return await config.mongoDB.collection('prizes').findOne(inputData, {projection: {_id: 0}});
  }

  async getSingleCategory(inputData) {
    return await config.mongoDB.collection('categories').findOne(inputData, {projection: {_id: 0}});
  }

  async getBillboard() {
    return await config.mongoDB.collection('billboards').find().sort({_id: -1}).limit(1).toArray();
  }

  async getAllQuestion(query) {
    return await config.mongoDB.collection('questions').find(query, {projection: {_id: 0}}).toArray();
  }


  async getFeatures(inputData) {
    return await config.mongoDB.collection('features').findOne(inputData, {projection: {_id: 0}});
  }

  async getDiscounts(inputData) {
    return await config.mongoDB.collection('discounts').find(inputData, {projection: {_id: 0}}).toArray();
  }

  async getDiscount(inputData) {
    return await config.mongoDB.collection('discounts').findOne(inputData, {projection: {_id: 0}});
  }

  async updateDiscount(inputData) {
    await config.mongoDB.collection('discounts').updateOne(inputData, {
      $set: {isUsed: true}
    });
    return config.mongoDB.collection('discounts').findOne({code: inputData.code}, {projection: {_id: 0}});
  }

  async searchCategories(item) {
    return await config.mongoDB.collection('categories').find(
      {$text: {$search: item}}
    ).toArray();
  }

  async addTicket(inputData) {
    await config.mongoDB.collection('tickets').insertOne(inputData);
  }

  async getCancellationQuestions(inputData) {
    return await config.mongoDB.collection('questions').find(inputData, {projection: {_id: 0}}).toArray();
  }

  async getSurveyQuestions(inputData) {
    return await config.mongoDB.collection('questions').find(inputData, {projection: {_id: 0}}).toArray();
  }

  async getUpdate() {
    return await config.mongoDB.collection('links').find({}, {projection: {_id: 0}}).toArray();
  }

  async getGuide() {
    return await config.mongoDB.collection('guide').find({}, {projection: {_id: 0}}).toArray();
  }

  async getMessages(inputData) {
    return await config.mongoDB.collection('messages').find(inputData, {projection: {_id: 0}}).toArray();
  }

  async getMessage(inputData) {
    return await config.mongoDB.collection('messages').findOne(inputData, {projection: {_id: 0}});
  }

  async addInvitation(inputData) {
    await config.mongoDB.collection('invitations').insertOne(inputData);
  }

  async updateInvitation(query, inputData) {
    await config.mongoDB.collection('invitations').updateOne(query, {
      $set: inputData
    })
  }

  async getInvitation(inputData) {
    return await config.mongoDB.collection('invitations').findOne(inputData);
  }

  async getMission(inputData) {
    return await config.mongoDB.collection('missions').findOne(inputData, {projection: {_id: 0}});
  }


  async updateMissionCounter(inputData) {
    await config.mongoDB.collection('missionCounter').updateOne({
      agentId: inputData.agentId,
      categoryId: inputData.categoryId,
      date: inputData.date
    }, {
      $set: inputData
    }, {upsert: true});
  }

  async getMissionCounter(inputData) {
    return await config.mongoDB.collection('missionCounter').findOne(inputData, {projection: {_id: 0}});
  }

  async getDailyVisit(inputData) {
    return await config.mongoDB.collection('dailyVisit').findOne({
      date: inputData.date,
      type: inputData.type
    }, {projection: {_id: 0}});
  }

  async getUserVisit(inputData) {
    return await config.mongoDB.collection('IpDailyVisit').findOne({
      date: inputData.date,
      ip: inputData.ip,
      type: inputData.type
    }, {projection: {_id: 0}});
  }

  async addDailyVisit(inputData) {
    await config.mongoDB.collection('dailyVisit').insertOne(inputData);
  }

  async addUserVisit(inputData) {
    await config.mongoDB.collection('IpDailyVisit').insertOne(inputData);
  }

  async addDailyView(inputData) {
    await config.mongoDB.collection('dailyVisit').updateOne({
        date: inputData.date,
        type: inputData.type
      },
      {
        $inc: {
          viewCounter: 1,
          pageViewCounter: 1
        }
      })
  }

  async addDailyViewPage(inputData) {
    await config.mongoDB.collection('dailyVisit').updateOne({
        date: inputData.date,
        type: inputData.type
      },
      {
        $inc: {
          pageViewCounter: 1
        }
      })
  }

  async updateUserCounter(inputData) {
    await config.mongoDB.collection('IpDailyVisit').updateOne({
        date: inputData.date,
        ip: inputData.ip,
        type: inputData.type
      },
      {
        $inc: {
          viewCounter: 1
        }
      })
  }
}

module.exports = GeneralRepository;