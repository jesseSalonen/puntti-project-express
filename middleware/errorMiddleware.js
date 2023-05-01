const logger = require("../logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  logger.error(err.message);

  res.json({
    message: err.message,
  });
};

module.exports = {
  errorHandler,
};
