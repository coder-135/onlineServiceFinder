let Kavenegar = require('kavenegar');
let smsSender = Kavenegar.KavenegarApi({
  apikey: process.env.SMS_API_KEY
});

const sendSms = async (inputData) => {
  return new Promise((resolve, reject) => {
    smsSender.VerifyLookup({
      receptor: inputData.phoneNumber,
      token: inputData.otp,
      template: inputData.pattern
    }, (response, status) => {
      resolve({response, status})
    });
  })
}

const sendAcceptanceServiceSms = async (inputData) => {
  return new Promise((resolve, reject) => {
    smsSender.VerifyLookup({
      receptor: inputData.userPhoneNumber,
      token10: inputData.fullName,
      token: inputData.agentPhoneNumber,
      token2: inputData.serviceCode,
      template: inputData.pattern
    }, (response, status) => {
      resolve({response, status})
    });
  })
}
const arrivalAgentSms = async (inputData) => {
  return new Promise((resolve, reject) => {
    smsSender.VerifyLookup({
      receptor: inputData.userPhoneNumber,
      token: inputData.agentPhoneNumber,
      token2: inputData.serviceCode,
      template: inputData.pattern
    }, (response, status) => {
      resolve({response, status})
    });
  })
}
const endOfServiceSms = async (inputData) => {
  return new Promise((resolve, reject) => {
    smsSender.VerifyLookup({
      receptor: inputData.userPhoneNumber,
      token: inputData.serviceCode,
      template: inputData.pattern
    }, (response, status) => {
      resolve({response, status})
    });
  })
}
const activationSms = async (inputData) => {
  return new Promise((resolve, reject) => {
    smsSender.VerifyLookup({
      receptor: inputData.userPhoneNumber,
      token10: inputData.fullName,
      token: 'باتشکر',
      template: 'activation'
    }, (response, status) => {
      resolve({response, status})
    });
  })
}
const cancellationServiceSms = async (inputData) => {
  return new Promise((resolve, reject) => {
    smsSender.VerifyLookup({
      receptor: inputData.userPhoneNumber,
      token10: inputData.fullName,
      token: 'باتشکر',
      template: 'cancellationService'
    }, (response, status) => {
      resolve({response, status})
    });
  })
}

module.exports = {sendSms, sendAcceptanceServiceSms, arrivalAgentSms , endOfServiceSms, activationSms , cancellationServiceSms}

