const asyncHandler = require("express-async-handler");
const Exercise = require("../models/exerciseModel");
const User = require("../models/userModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");

// @desc  Get exercises
// @route GET /api/exercises
// @access Private
const getExercises = asyncHandler(async (req, res) => {
  try {
    const exercises = await Exercise.find({}).populate("muscles");
    res.status(StatusCodes.OK).json(exercises);
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error getting exercises");
  }
});

// @desc  Add exercise
// @route POST /api/exercises
// @access Private
const addExercise = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("No name field in request");
  }

  try {
    const exercise = await Exercise.create({
      name: req.body.name,
      description: req.body.description,
      user: req.user.id,
      muscles: req.body.exerciseMuscles,
    });
    res.status(StatusCodes.OK).json(exercise);
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error adding exercise");
  }
});

// @desc  Update exercise
// @route PUT /api/exercises/:id
// @access Private
const updateExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Exercise not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  // // Make sure the logged in user matches the exercise user
  // if (exercise.user.toString() !== req.user.id) {
  //   res.status(StatusCodes.UNAUTHORIZED);
  //   throw new Error("User not authorized");
  // }

  const updatedExercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedExercise) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to update exercise");
  }
  res.status(StatusCodes.OK).json(updatedExercise);
});

// @desc  Delete exercise
// @route DELETE /api/exercises/:id
// @access Private
const deleteExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Exercise not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  // // Make sure the logged in user matches the exercise user
  // if (exercise.user.toString() !== req.user.id) {
  //   res.status(StatusCodes.UNAUTHORIZED);
  //   throw new Error("User not authorized");
  // }
  const deleteCount = await exercise.deleteOne();

  if (!deleteCount) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to delete exercise");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
};
