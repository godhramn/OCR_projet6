const passwordValidator = require("password-validator");

const schema = new passwordValidator();

schema
  .is()
  .min(8)
  .is()
  .max(64);

module.exports = (req, res, next) => {
  if (schema.validate(req.body.password)) {
    next();
  } else {
    res.status(400).json({error: schema.validate(req.body.password, { list: true })});
  }
};