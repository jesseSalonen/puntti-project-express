const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const logger = require("../logger");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      logger.info(`User "${req.user.name}" authenticated!`);

      next();
    } catch (error) {
      logger.error(error);
      res.status(401);
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    logger.error(new Error("Not authorized, no token"));
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
