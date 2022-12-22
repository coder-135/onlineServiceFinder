async function validate(inputData, schema) {
  try {
    await schema.validate(inputData, {abortEarly: false});
  } catch (err) {
    throw {
      status: 400,
      data: {
        message: err.errors
      }
    }
  }
}
module.exports = validate;
