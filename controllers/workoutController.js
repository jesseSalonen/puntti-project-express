const asyncHandler = require("express-async-handler");
const Workout = require("../models/workoutModel");
const User = require("../models/userModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");

// @desc  Get workouts
// @route GET /api/workouts
// @access Private
const getWorkouts = asyncHandler(async (req, res) => {
  try {
    const workouts = await Workout.find({}).populate("exercises");
    res.status(StatusCodes.OK).json(workouts);
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error getting workouts");
  }
});

// @desc  Add workout
// @route POST /api/workouts
// @access Private
const addWorkout = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("No name field in request");
  }

  try {
    const workout = await Workout.create({
      name: req.body.name,
      description: req.body.description,
      user: req.user.id,
      exercises: req.body.workoutExercises,
    });
    res.status(StatusCodes.OK).json(workout);
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error adding workout");
  }
});

// @desc  Update workout
// @route PUT /api/workouts/:id
// @access Private
const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Workout not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  // // Make sure the logged in user matches the workout user
  // if (workout.user.toString() !== req.user.id) {
  //   res.status(StatusCodes.UNAUTHORIZED);
  //   throw new Error("User not authorized");
  // }

  const updatedWorkout = await Workout.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedWorkout) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to update workout");
  }
  res.status(StatusCodes.OK).json(updatedWorkout);
});

// @desc  Delete workout
// @route DELETE /api/workouts/:id
// @access Private
const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Workout not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  // // Make sure the logged in user matches the workout user
  // if (workout.user.toString() !== req.user.id) {
  //   res.status(StatusCodes.UNAUTHORIZED);
  //   throw new Error("User not authorized");
  // }
  const deleteCount = await workout.deleteOne();

  if (!deleteCount) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to delete workout");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
};
