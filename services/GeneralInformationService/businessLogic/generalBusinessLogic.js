const GeneralRepository = require('../repository/generalRepository')
const AgentRepository = require('../../AgentManagerService/repository/agentRepository');
const UserRepository = require('../../UserManagerService/repository/userRepository');

const moment = require('moment-jalaali');
const uuid = require('uuid');

class GeneralBusinessLogic {
  constructor() {
  }

  async skills() {
    let allSkill = [];
    const skills = await new GeneralRepository().getSkills();
    skills.forEach(item => {
      allSkill.push(item.name);
    })
    return {
      status: 'success',
      data: {
        message: "دریافت مهارت ها با موفقیت انجام شد",
        result: allSkill
      }
    }
  }

  async getAllCategories() {
    const result = await new GeneralRepository().getAllCategories();
    if (!result) {
      throw {
        status: 404,
        data: {
          message: 'دسته بندی یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'دریافت دسته بندی ها با موفقیت انجام شد',
        result
      }
    }
  }

  async getSubCategories(inputData) {
    const result = await new GeneralRepository().getSubCategories(inputData);
    if (!result) {
      throw {
        status: 404,
        data: {
          message: 'دسته بندی یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'دریافت دسته بندی ها با موفقیت انجام شد',
        result
      }
    }
  }

  async getCategory(inputData) {
    const result = await new GeneralRepository().getCategory(inputData);
    if (!result) {
      throw {
        status: 404,
        data: {
          message: 'دسته بندی یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'دریافت دسته بندی ها با موفقیت انجام شد',
        result
      }
    }
  }

  async getRules() {
    const result = await new GeneralRepository().getRules();
    return {
      status: 'success',
      data: {
        message: "قوانین با موفقیت دریافت شد",
        result: result ? result : null
      }
    }
  }

  async getAboutUs() {
    const result = await new GeneralRepository().getAboutUs();
    return {
      status: 'success',
      data: {
        message: "درباره ما با موفقیت دریافت شد",
        result: result[0]
      }
    }
  }

  async getContactUs() {
    let result = await new GeneralRepository().getContactUs();
    result = result[0];
    return {
      status: 'success',
      data: {
        message: "اطلاعات ارتباط با ما با موفقیت دریافت شد",
        result: {
          whatsapp: result.whatsapp,
          email: result.email,
          phoneNumber: result.phoneNumber
        }
      }
    }
  }

  async getBillboard() {
    const result = await new GeneralRepository().getBillboard();
    if (!result) {
      throw {
        status: 404,
        data: {
          message: 'بیلبوردی یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'دریافت بیلبورد با موفقیت انجام شد',
        result: result[0]
      }
    }
  }

  async getAllSurveyQuestion(inputData) {
    inputData.category = 'survey';
    const result = await new GeneralRepository().getAllQuestion(inputData);
    if (!result) {
      throw {
        status: 404,
        data: {
          message: 'سوالی یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'دریافت سوالات نظرسنجی با موفقیت انجام شد',
        result
      }
    }
  }

  async getAllCancellationQuestion(inputData) {
    inputData.category = 'cancellation';
    const result = await new GeneralRepository().getAllQuestion(inputData);
    if (!result) {
      throw {
        status: 404,
        data: {
          message: 'سوالی  یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'دریافت سوالات با موفقیت انجام شد',
        result
      }
    }
  }

  async searchCategories(item) {
    item = this.arabicCharacterToPersian(item)
    const result = await new GeneralRepository().searchCategories(item);
    if (!result || result.length === 0) {
      throw {
        status: 404,
        data: {
          message: 'داده ای برای جستجوی شما یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'نتیجه جستجوی شما',
        result: result
      }
    }
  }

  async addTicket(inputData) {
    await new GeneralRepository().addTicket(inputData);
    delete inputData._id;

    return {
      data: {
        message: 'تیکت شما ثبت شد',
        result: inputData
      }
    }
  }

  async getCancellationQuestions(inputData) {
    let questions = await new GeneralRepository().getCancellationQuestions(inputData);
    questions = questions.map(item => {
      return {
        question: item.text,
        id: item.id,
        answer: null
      }
    })
    return {
      data: {
        message: 'دریافت سوالات لغو سرویس با موفقیت انجام شد',
        result: questions
      }
    }
  }

  async getSurveyQuestions(inputData) {
    let questions = await new GeneralRepository().getSurveyQuestions(inputData);
    questions = questions.map(item => {
      return {
        question: item.text,
        id: item.id,
        answer: null
      }
    })
    return {
      data: {
        message: 'دریافت سوالات نظرسنجی با موفقیت انجام شد',
        result: questions
      }
    }
  }

  async getPrizes() {
    let result = await new GeneralRepository().getPrizes();
    return {
      status: 'success',
      data: {
        message: "جوایز با موفقیت دریافت شد",
        result
      }
    }
  }

  async getPrize(inputData) {
    let result = await new GeneralRepository().getPrize(inputData);
    return {
      status: 'success',
      data: {
        message: "جایزه با موفقیت دریافت شد",
        result
      }
    }
  }

  async getUpdate() {
    let result = await new GeneralRepository().getUpdate();
    return {
      status: 'success',
      data: {
        message: ' لینک های آپدیت با موفقیت دریافت شد',
        result: result[0]
      }
    }
  }

  async getGuide() {
    let result = await new GeneralRepository().getGuide();
    return {
      status: 'success',
      data: {
        message: ' لینک های آپدیت با موفقیت دریافت شد',
        result: result[0]
      }
    }
  }

  async getMessages(inputData) {
    let result = await new GeneralRepository().getMessages(inputData);
    return {
      status: 'success',
      data: {
        message: 'پیام های کارگزار با موفقیت دریافت شد',
        result
      }
    }
  }

  async getMessage(inputData) {
    let result = await new GeneralRepository().getMessage(inputData);
    return {
      status: 'success',
      data: {
        message: 'پیام کارگزار با موفقیت دریافت شد',
        result
      }
    }
  }

  async addInvitation(inputData) {

    if (inputData.type === 'agent') {
      const agentStatus = await new AgentRepository().getAgent('phoneNumber', inputData.phoneNumber);
      if (agentStatus)
        throw {
          status: 409,
          data: {
            message: 'شماره مد نظر قبلا در پلتفرم هایو ثبت شده است '
          }
        }
    } else {
      const userStatus = await new UserRepository().getUser('phoneNumber', inputData.phoneNumber);
      if (userStatus)
        throw {
          status: 409,
          data: {
            message: 'شماره مد نظر قبلا در پلتفرم هایو ثبت شده است '
          }
        }
    }
    const invitationStatus = await new GeneralRepository().getInvitation(inputData);
    if (invitationStatus)
      throw {
        status: 409,
        data: {message: 'شما قبلا این شماره را دعوت کرده اید'}
      }
    await new GeneralRepository().addInvitation(inputData);
    return {
      status: 'success',
      data: {
        message: 'شماره مورد نظر با موفقیت دعوت شد'
      }
    }
  }

  async getMission(inputData) {
    let missions = [];
    let agent = await new AgentRepository().getAgent('agentId', inputData.agentId);
    for (let i = 0; i < agent.categoryIds.length; i++) {
      let query = {
        categoryId: agent.categoryIds[i],
        endDate: {$gte: moment().format('jYYYYjMMjDD')}
      }
      const mission = await new GeneralRepository().getMission(query);
      if (mission)
        missions.push(mission);
    }
    if (missions.length === 0) {
      return {
        status: 'success',
        data: {
          message: 'ماموریتی برای شما یافت نشد'
        }
      }
    }
    return {
      status: 'success',
      data: {
        message: 'ماموریت ها با موفقیت دریافت شد',
        result: missions
      }
    }
  }

  async getMissionCounter(inputData) {
    let missionCounterData = await new GeneralRepository().getMissionCounter(inputData);
    if (!missionCounterData) {
      missionCounterData = {
        title: '',
        agentId: inputData.agentId,
        categoryId: '',
        date: moment().format('jYYYY/jMM/jDD'),
        counter: 0
      }
    }
    return {
      status: 'success',
      data: {
        message: 'تعداد ماموریت ها با موفقیت دریافت شد',
        result: missionCounterData
      }
    }
  }


  async getDiscounts(inputData) {

    let discounts = await new GeneralRepository().getDiscounts(inputData);
    if (discounts.length === 0)
      throw {
        status: 404,
        data: {
          message: 'کد تخفیفی یافت نشد'
        }
      }
    return {
      status: 'success',
      data: {
        message: 'کد تخفیف ها با موفقیت دریافت شد',
        result: discounts
      }
    }
  }

  async useDiscount(inputData) {
    let discount = await new GeneralRepository().getDiscount({code: inputData.code});
    if (!discount)
      throw {
        data: {
          message: 'کد تخفیف معتبر نیست'
        }
      }
    if (moment().format('jYYYY/jMM/jDD') > discount.expirationDate || discount.isUsed)
      throw {
        data: {
          message: 'کد تخفیف منقضی شده است'
        }
      }
    inputData = await new GeneralRepository().updateDiscount(inputData);

    return {
      status: 'success',
      data: {
        message: 'کد تخفیف با موفقیت ویرایش و دریافت شد',
        result: inputData
      }
    }
  }

  async addDailyVisit(inputData) {
    let dailyVisit = await new GeneralRepository().getDailyVisit(inputData);
    if (!dailyVisit) {
      const visitData = {
        id: uuid.v4(),
        date: inputData.date,
        viewCounter: 1,
        pageViewCounter: 1,
        type: inputData.type
      }
      const userViewDetail = {
        ip: inputData.ip,
        viewCounter: 1,
        date: inputData.date,
        type: inputData.type
      }
      await new GeneralRepository().addUserVisit(userViewDetail);
      await new GeneralRepository().addDailyVisit(visitData);
    } else {
      let userVisitDetail = await new GeneralRepository().getUserVisit(inputData);
      if (userVisitDetail) {
        await new GeneralRepository().addDailyViewPage(inputData);
        await new GeneralRepository().updateUserCounter(inputData);
      } else {
        const userViewDetail = {
          ip: inputData.ip,
          viewCounter: 1,
          date: inputData.date,
          type: inputData.type
        }
        await new GeneralRepository().addDailyView(inputData);
        await new GeneralRepository().addUserVisit(userViewDetail);
      }
    }
    return {
      status: 'success',
      data: {
        message: 'بازدید با موفقیت ثبت شد',
      }
    }
  }

  arabicCharacterToPersian(text) {
    if (typeof text !== 'string')
      return text;
    text = text
      .replace(/(إٔ)/g, 'ا')
      .replace(/(اِ)/g, 'ا')
      .replace(/(ا)/g, 'ا')
      .replace(/(اِ)/g, 'ا')
      .replace(/(أ)/g, 'ا')
      .replace(/(إ)/g, 'ا')
      .replace(/(ی)/g, 'ی')
      .replace(/(ي)/g, 'ی')
      .replace(/(ى)/g, 'ی')
      .replace(/(ك)/g, 'ک')
      .replace(/(دِ)/g, 'د')
      .replace(/(بِ)/g, 'ب')
      .replace(/(زِ)/g, 'ز')
      .replace(/(ذِ)/g, 'ذ')
      .replace(/(ِسِ)/g, 'س')
      .replace(/(ِشِِ)/g, 'ش').trim();
    return text;
  }

}

module.exports = GeneralBusinessLogic;