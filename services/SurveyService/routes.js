const router = require('express').Router();
const SurveyController = require('./controller/surveyController');

router.post('/survey/agent',  SurveyController.prototype.addAgentSurvey);
router.post('/survey/user',  SurveyController.prototype.addUserSurvey);

module.exports = router;