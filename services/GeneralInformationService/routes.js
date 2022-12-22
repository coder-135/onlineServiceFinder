const router = require('express').Router();
const GeneralController = require('./controller/generalController');

router.get('/general/skills',GeneralController.prototype.skills);
router.get('/general/category',GeneralController.prototype.getCategory);
router.get('/general/billboard',GeneralController.prototype.getBillboard);

router.get('/general/categories',GeneralController.prototype.getAllCategories);
router.get('/general/rules',GeneralController.prototype.getRules);
router.get('/general/aboutUs',GeneralController.prototype.getAboutUs);
router.get('/general/contactUs',GeneralController.prototype.getContactUs);


router.get('/general/surveyQuestion',GeneralController.prototype.getAllSurveyQuestion);
router.get('/general/cancellationQuestion',GeneralController.prototype.getAllCancellationQuestion);
router.post('/general/subCategories',GeneralController.prototype.getSubCategories);
router.post('/general/searchCategories',GeneralController.prototype.searchCategories);


router.post('/general/ticket', GeneralController.prototype.addTicket);

router.get('/general/discount', GeneralController.prototype.getDiscounts);
router.put('/general/discount', GeneralController.prototype.useDiscount);

router.get('/general/prizes', GeneralController.prototype.getPrizes);
router.get('/general/prize', GeneralController.prototype.getPrize);



router.get('/general/update', GeneralController.prototype.getUpdate);
router.get('/general/guide', GeneralController.prototype.getGuide);

router.post('/general/invitation', GeneralController.prototype.addInvitation);

//ماموریت
router.get('/general/mission', GeneralController.prototype.getMission);
router.get('/general/missionCounter', GeneralController.prototype.getMissionCounter);


//پیام رسان
router.get('/general/messages', GeneralController.prototype.getMessages);
router.get('/general/message', GeneralController.prototype.getMessage);


// سوالات مربوط به نظرسنجی و لغو سرویس
router.get('/general/cancellationQuestions', GeneralController.prototype.getCancellationQuestions);
router.get('/general/surveyQuestions', GeneralController.prototype.getSurveyQuestions);


router.get('/general/visit', GeneralController.prototype.addDailyVisit)


module.exports = router;