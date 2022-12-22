const PaymentBusinessLogic = require('../businessLogic/paymentBusinessLogic');
const validate = require('../../../utility/validator');
const {paymentSchema} = require('../../../utility/schema');

class PaymentController {
  constructor() {
  }

  async paymentRequest(req, res) {
    try {
      await validate(req.body, paymentSchema);
      let inputData = {
        amount: +req.body.amount,
        phoneNumber: req.body.phoneNumber,
        category: req.body.category,
        additionalData: {
          nationalId: req.body.nationalId,
          description: req.body.description
        }
      }
      if (inputData.category === 'wallet')
        inputData.additionalData.id = req.body.id;
      let result = await new PaymentBusinessLogic().paymentRequest(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: (err.data) ? err.data : {message: err.message}
      });
    }
  }

  async verifyPayment(req, res) {
    try {
      const inputData = req.body;
      let result = await new PaymentBusinessLogic().verifyPayment(inputData);
      res.redirect(`/payment/success?trackingNumber=${result.trackingNumber}&orderId=${result.orderId}&message=${result.message}`);
    } catch (err) {
      if (err.inputData.category === 'wallet') {
        res.redirect(`/payment/error?message=${err.message}&amount=${err.inputData.amount}&phoneNumber=${err.inputData.phoneNumber
        }&category=${err.inputData.category}&nationalId=${err.inputData.nationalId}&description=${err.inputData.description}&id=${err.inputData.id}`);
      } else {
        res.redirect(`/payment/error?message=${err.message}&amount=${err.inputData.amount}&phoneNumber=${err.inputData.phoneNumber
        }&category=${err.inputData.category}&nationalId=${err.inputData.nationalId}&description=${err.inputData.description}`);
      }
    }
  }

  async checkPayment(req, res) {
    try {
      if (!req.query.token) {
        throw {
          data: {
            message: 'توکن پرداخت ارسال نشده است'
          }
        }
      }
      const inputData = {token: req.query.token}
      let result = await new PaymentBusinessLogic().checkPayment(inputData);
      res.status(200).send(result);
    } catch (err) {
      const status = err.status || 400;
      res.status(status).send({
        status: "fail",
        data: (err.data) ? err.data : {message: err.message}
      });
    }
  }


}

module.exports = PaymentController;