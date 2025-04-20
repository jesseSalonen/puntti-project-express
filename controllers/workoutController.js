const asyncHandler = require("express-async-handler");
const Workout = require("../models/workoutModel");
const User = require("../models/userModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");

// @desc  Get workouts
// @route GET /api/workouts
// @access Private
const getWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({})
    .populate({
      path: 'exercises.exercise',
      model: 'Exercise',
      populate: {
        path: 'muscles',
        model: 'Muscle'
      }
    })
    .populate('user', 'name email');
  
  res.status(StatusCodes.OK).json(workouts);
});

// @desc  Get workout
// @route GET /api/workouts/:id
// @access Private
const getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id)
    .populate({
      path: 'exercises.exercise',
      model: 'Exercise',
      populate: {
        path: 'muscles',
        model: 'Muscle'
      }
    })
    .populate('user', 'name email');

  if (!workout) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Workout not found");
  }

  res.status(StatusCodes.OK).json(workout);
});

// @desc  Add workout
// @route POST /api/workouts
// @access Private
const addWorkout = asyncHandler(async (req, res) => {
  const { name, description, workoutExercises } = req.body;
  
  // Format the exercises array with direct set data
  const processedExercises = workoutExercises.map(exerciseData => ({
    exercise: exerciseData._id,
    sets: exerciseData.sets || []
  }));
  
  // Create the workout with processed exercises
  const workout = await Workout.create({
    name,
    description,
    user: req.user.id,
    exercises: processedExercises
  });
  
  // Fetch the complete workout with populated references
  const populatedWorkout = await Workout.findById(workout._id)
    .populate({
      path: 'exercises.exercise',
      model: 'Exercise',
      populate: {
        path: 'muscles',
        model: 'Muscle'
      }
    });
  
  if (!populatedWorkout) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error retrieving created workout");
  }
  
  res.status(StatusCodes.OK).json(populatedWorkout);
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

  // Extract and process only the fields we need
  const { name, description, workoutExercises } = req.body;
  
  // If workoutExercises is provided, process them
  let updateData = { name, description };
  
  if (workoutExercises) {
    // Format the exercises array with direct set data
    const processedExercises = workoutExercises.map(exerciseData => ({
      exercise: exerciseData._id,
      sets: exerciseData.sets || []
    }));
    
    updateData.exercises = processedExercises;
  }

  const updatedWorkout = await Workout.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate({
    path: 'exercises.exercise',
    model: 'Exercise',
    populate: {
      path: 'muscles',
      model: 'Muscle'
    }
  });

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

  const deleteResult = await workout.deleteOne();

  if (!deleteResult) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to delete workout");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getWorkouts,
  getWorkout,
  addWorkout,
  updateWorkout,
  deleteWorkout,
};