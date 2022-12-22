const SurveyBusinessLogic = require('../businessLogic/surveyBusinessLogic');
const AccessManager = require('../../../utility/accessManagerService/accessManager');
const moment = require('moment-jalaali');

class SurveyController {
  constructor() {
  }

  async addAgentSurvey(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      const inputData = {
        serviceCode: req.body.serviceCode,
        rate: req.body.rate,
        questions: req.body.questions,
        description: req.body.description ? req.body.description : null,
        type: 'agent',
        date: moment().format('jYYYYjMMjDD'),
        time: moment().format('HH:mm:ss')
      }
      let result = await new SurveyBusinessLogic().addAgentSurvey(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async addUserSurvey(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      const inputData = {
        serviceCode: req.body.serviceCode,
        rate: req.body.rate,
        questions: req.body.questions,
        type: 'user',
        date: moment().format('jYYYYjMMjDD'),
        time: moment().format('HH:mm:ss')
      }
      let result = await new SurveyBusinessLogic().addAgentSurvey(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }


}

module.exports = SurveyController;