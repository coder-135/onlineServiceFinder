const GeneralBusinessLogic = require('../businessLogic/generalBusinessLogic');
const validator = require('../../../utility/validator');
const uuid = require('uuid');
const moment = require('moment-jalaali');

class GeneralController {

  constructor() {
  }

  async skills(req, res) {
    try {

      let result = await new GeneralBusinessLogic().skills();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getAllCategories(req, res) {
    try {

      let result = await new GeneralBusinessLogic().getAllCategories();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getSubCategories(req, res) {
    try {

      const inputData = {
        type: +req.body.type,
        parentCategoryId: req.body.parentCategoryId
      }

      let result = await new GeneralBusinessLogic().getSubCategories(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getCategory(req, res) {
    try {
      let inputData = {};
      if (+req.query.type === 2) {
        inputData.type = 2;
        inputData.parentCategoryId = req.query.id
      }
      if (+req.query.type === 3) {
        inputData.type = 3;
        inputData.subParentCategoryId = req.query.id
      }
      let result = await new GeneralBusinessLogic().getCategory(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getRules(req, res) {
    try {
      let result = await new GeneralBusinessLogic().getRules();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getAboutUs(req, res) {
    try {
      let result = await new GeneralBusinessLogic().getAboutUs();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getContactUs(req, res) {
    try {
      let result = await new GeneralBusinessLogic().getContactUs();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getBillboard(req, res) {
    try {
      let result = await new GeneralBusinessLogic().getBillboard();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: 'fail',
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getAllSurveyQuestion(req, res) {
    try {
      if (!req.query.type) {
        throw {
          data: {message: 'لطفا نوع سوالات را بفرستید'}
        }
      }
      let result = await new GeneralBusinessLogic().getAllSurveyQuestion({type: req.query.type});
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: 'fail',
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getAllCancellationQuestion(req, res) {
    try {
      if (!req.query.type) {
        throw {
          data: {message: 'لطفا نوع سوالات را بفرستید'}
        }
      }
      let result = await new GeneralBusinessLogic().getAllCancellationQuestion({type: req.query.type});
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: 'fail',
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async searchCategories(req, res) {
    try {
      const item = req.body.item;
      if (!item) {
        throw {
          data: {
            message: 'کلمه ای برای جست و جو ارسال نشده است'
          }
        }
      }
      let result = await new GeneralBusinessLogic().searchCategories(item);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: 'fail',
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async addTicket(req, res) {
    try {
      if (!req.body.title || !req.body.description) {
        throw {
          data: {
            message: 'داده های ورودی را بررسی کنید'
          }
        }
      }
      const inputData = {
        title: req.body.title,
        description: req.body.description,
        id: req.body.agentId || req.body.userId,
        ticketId: uuid.v4(),
        date: moment().format('jYYYYjMMjDD'),
        time: moment().format('HH:mm:ss'),
        checkStatus: false
      };
      let result = await new GeneralBusinessLogic().addTicket(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: 'fail',
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getDiscounts(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      if (!req.query.userId) {
        throw {
          data: {
            message: 'شناسه کاربر ارسال نشده است'
          }
        }
      }

      let result = await new GeneralBusinessLogic().getDiscounts({userId: req.query.userId});
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async useDiscount(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');

      if (!req.body.userId || !req.body.code) {
        throw {
          data: {
            message: 'داده های ورودی بررسی شود'
          }
        }
      }

      const inputData = {
        userId: req.body.userId,
        code: req.body.code
      };

      let result = await new GeneralBusinessLogic().useDiscount(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getPrizes(req, res) {
    try {
      let result = await new GeneralBusinessLogic().getPrizes();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getPrize(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      if (!req.query.id) {
        throw {
          data: {message: 'شناسه ارسال نشده است'}
        }
      }
      const inputData = {
        id: req.query.id
      };

      let result = await new GeneralBusinessLogic().getPrize(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getUpdate(req, res) {
    try {

      let result = await new GeneralBusinessLogic().getUpdate();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getGuide(req, res) {
    try {
      let result = await new GeneralBusinessLogic().getGuide();
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async addInvitation(req, res) {
    try {

      if (!req.body.phoneNumber) {
        throw {
          data: {
            message: 'شماره موبایل ارسال نشده است'
          }
        }
      }
      const inputData = {
        id: req.body.agentId || req.body.userId,
        phoneNumber: req.body.phoneNumber,
        type: req.body.type,
        status: false
      };

      let result = await new GeneralBusinessLogic().addInvitation(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getMessages(req, res) {
    try {
      if (!req.query.agentId) {
        throw {
          data: {
            message: 'شناسه کارگذار ارسال نشده است'
          }
        }
      }
      const inputData = {
        agentId: req.query.agentId
      };
      let result = await new GeneralBusinessLogic().getMessages(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getMessage(req, res) {
    try {

      if (!req.query.id) {
        throw {
          data: {
            message: 'شناسه پیام ارسال نشده است'
          }
        }
      }
      const inputData = {
        id: req.query.id
      };

      let result = await new GeneralBusinessLogic().getMessage(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getCancellationQuestions(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      if (!req.query.type) {
        throw {
          data: {
            message: 'لطفا نوع سوالات لغو سرویس را مشخص نمایید'
          }
        }
      }
      const inputData = {
        category: 'cancellation',
        type: req.query.type
      }
      let result = await new GeneralBusinessLogic().getCancellationQuestions(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getSurveyQuestions(req, res) {
    try {
      // await new AccessManager().checkAccessControl(req, res, 'avatar');
      if (!req.query.type) {
        throw {
          data: {
            message: 'لطفا نوع سوالات نظرسنجی را مشخص نمایید'
          }
        }
      }
      const inputData = {
        category: 'survey',
        type: req.query.type
      }
      let result = await new GeneralBusinessLogic().getSurveyQuestions(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getMission(req, res) {
    try {
      if (!req.query.agentId) {
        throw {
          data: {
            message: 'شناسه کارگذار ارسال نشده است'
          }
        }
      }
      const inputData = {
        agentId: req.query.agentId
      };
      let result = await new GeneralBusinessLogic().getMission(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async getMissionCounter(req, res) {
    try {
      if (!req.query.agentId) {
        throw {
          data: {
            message: 'شناسه کارگذار ارسال نشده است'
          }
        }
      }
      const inputData = {
        agentId: req.query.agentId
      };

      let result = await new GeneralBusinessLogic().getMissionCounter(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }

  async addDailyVisit(req, res) {
    try {
      if (req.query.type !== 'user' && req.query.type !== 'agent') {
        throw {
          data: {
            message: 'نوع بازدید را ارسال نمایید'
          }
        }
      }
      const inputData = {
        ip: req.headers["x-real-ip"] || req.ip,
        date: moment().format('jYYYYjMMjDD'),
        type: req.query.type
      };
      res.status(200).send({
        status: 'success',
        data: {
          message: 'بازدید با موفقیت ثبت شد',
        }
      });
      await new GeneralBusinessLogic().addDailyVisit(inputData);

    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: err.data ? err.data : {message: err.message}
      });
    }
  }


}

module.exports = GeneralController;