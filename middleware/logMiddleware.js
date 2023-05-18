const logger = require("../logger");

const logRequest = (req, res, next) => {
  let copyBody = { ...req.body };
  delete copyBody.password;
  logger.info(`${req.method} ${req.path}`, copyBody);
  next();
};

module.exports = { logRequest };
