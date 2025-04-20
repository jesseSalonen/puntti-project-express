const asyncHandler = require("express-async-handler");
const Exercise = require("../models/exerciseModel");
const User = require("../models/userModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");

// @desc  Get exercises
// @route GET /api/exercises
// @access Private
const getExercises = asyncHandler(async (req, res) => {
  const exercises = await Exercise.find({}).populate("muscles").populate("user", "name email");
  res.status(StatusCodes.OK).json(exercises);
});

// @desc  Get exercise
// @route GET /api/exercises/:id
// @access Private
const getExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findById(req.params.id).populate("muscles");
  
  if (!exercise) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Exercise not found");
  }
  
  res.status(StatusCodes.OK).json(exercise);
});

// @desc  Add exercise
// @route POST /api/exercises
// @access Private
const addExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.create({
    name: req.body.name,
    description: req.body.description,
    user: req.user.id,
    muscles: req.body.exerciseMuscles,
  });
  
  if (!exercise) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to create exercise");
  }
  
  res.status(StatusCodes.OK).json(exercise);
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

  const updatedExercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      muscles: req.body.exerciseMuscles,
    },
    { new: true }
  ).populate('muscles');

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

  const deleteCount = await exercise.deleteOne();

  if (!deleteCount) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to delete exercise");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getExercises,
  getExercise,
  addExercise,
  updateExercise,
  deleteExercise,
};