const asyncHandler = require("express-async-handler");
const Muscle = require("../models/muscleModel");
const User = require("../models/userModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");

// @desc  Add muscle
// @route POST /api/muscles
// @access Private
const addMuscle = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("No name field in request");
  }
  
  try {
    // Check if a muscle with the same name already exists
    const existingMuscle = await Muscle.findOne({ name: req.body.name });
    if (existingMuscle) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error("Muscle with this name already exists");
    }
    const muscle = await Muscle.create({
      name: req.body.name,
      upper: req.body.upper ?? false,
      lower: req.body.lower ?? false,
      pushing: req.body.pushing ?? false,
      pulling: req.body.pulling ?? false,
    });
    res.status(StatusCodes.OK).json(muscle);
  } catch (error) {
    logger.error(error);
    if (error.message === "Muscle with this name already exists") {
      throw error;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      throw new Error("Error adding muscle");
    }
  }
});

// @desc  Get muscles
// @route GET /api/muscles
// @access Private
const getMuscles = asyncHandler(async (req, res) => {
  try {
    const muscles = await Muscle.find({});
    res.status(StatusCodes.OK).json(muscles);
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error getting muscles");
  }
});

// @desc  Update muscle
// @route PUT /api/muscles/:id
// @access Private
const updateMuscle = asyncHandler(async (req, res) => {
  const muscle = await Muscle.findById(req.params.id);

  if (!muscle) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Muscle not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  const updatedMuscle = await Muscle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedMuscle) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to update muscle");
  }
  res.status(StatusCodes.OK).json(updatedMuscle);
});

// @desc  Delete muscle
// @route DELETE /api/muscles/:id
// @access Private
const deleteMuscle = asyncHandler(async (req, res) => {
  const muscle = await Muscle.findById(req.params.id);

  if (!muscle) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Muscle not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  const deleteCount = await muscle.deleteOne();

  if (!deleteCount) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to delete muscle");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getMuscles,
  addMuscle,
  updateMuscle,
  deleteMuscle,
};
