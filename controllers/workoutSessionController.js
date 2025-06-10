const asyncHandler = require("express-async-handler");
const WorkoutSession = require("../models/workoutSessionModel");
const User = require("../models/userModel");
const Workout = require("../models/workoutModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");
const { Types } = require('mongoose');

// Deep populate configuration for exercisePerformances and their related data
const exercisePerformancePopulateConfig = {
  path: 'exercisePerformances.exercise',
  model: 'Exercise',
  populate: {
    path: 'muscles',
    model: 'Muscle'
  }
};

// @desc  Get workout sessions
// @route GET /api/workout-sessions
// @access Private
const getWorkoutSessions = asyncHandler(async (req, res) => {
  const workoutSessions = await WorkoutSession.find({ user: req.user.id })
    .populate(exercisePerformancePopulateConfig)
    .populate('workout')
    .populate('program')
    .populate('user', 'subscribedPrograms');

  res.status(StatusCodes.OK).json(workoutSessions);
});

// @desc  Get workout session
// @route GET /api/workout-sessions/:id
// @access Private
const getWorkoutSession = asyncHandler(async (req, res) => {
  const workoutSession = await WorkoutSession.findById(req.params.id)
    .populate(exercisePerformancePopulateConfig)
    .populate('workout')
    .populate('program')
    .populate('user', 'name email');

  if (!workoutSession) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Workout session not found');
  }

  // Check if the session belongs to the user
  if (workoutSession.user._id.toString() !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error('Not authorized to access this workout session');
  }

  // For each exercise performance, find the latest completed session with this exercise
  const enhancedExercisePerformances = await Promise.all(
    workoutSession.exercisePerformances.map(async (performance) => {
      const exerciseId = performance.exercise._id;

      // Find the latest completed workout session that contains this exercise
      // Excluding the current session
      const latestSession = await WorkoutSession.findOne({
        user: req.user.id,
        status: 'completed',
        _id: {$ne: workoutSession._id},
        'exercisePerformances': {
          $elemMatch: {
            'exercise': exerciseId,
            'sets': {
              $elemMatch: {
                'weight': {$gt: 0},
                'reps': {$gt: 0}
              }
            }
          }
        }
      }).sort({completedAt: -1});

      // Convert to a plain object to allow adding new properties
      const performanceObj = performance.toObject();

      if (latestSession) {
        // Find the exercise performance in the latest session
        const latestPerformance = latestSession.exercisePerformances.find(
          p => p.exercise.toString() === exerciseId.toString()
        );

        if (latestPerformance && latestPerformance.sets.length > 0) {
          // Add the historical data to the performance
          performanceObj.lastPerformance = {
            date: latestSession.completedAt,
            sessionId: latestSession._id,
            sets: latestPerformance.sets
          };
        }
      }

      return performanceObj;
    })
  );

  // Create a response object with the enhanced exercise performances
  const responseData = workoutSession.toObject();
  responseData.exercisePerformances = enhancedExercisePerformances;

  res.status(StatusCodes.OK).json(responseData);
});

// @desc  Add workout session
// @route POST /api/workout-sessions
// @access Private
const addWorkoutSession = asyncHandler(async (req, res) => {
  const {
    workoutId,
    programId,
    programDay
  } = req.body;

  if (!workoutId) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Please provide a workout ID");
  }

  // First, find the workout to get its exercises
  const workout = await Workout.findById(workoutId).populate('exercises.exercise');

  if (!workout) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Workout not found");
  }

  // Transform workout exercises to exercisePerformances
  const exercisePerformances = workout.exercises.map(workoutExercise => {
    return {
      exercise: workoutExercise.exercise._id,
      sets: workoutExercise.sets.map(set => ({
        weight: 0,
        reps: set.reps || 0,
        dropSet: set.dropSet || false,
        restPause: set.restPause || false,
        completed: false,
        notes: ""
      }))
    };
  });

  // Create the workout session
  const workoutSession = await WorkoutSession.create({
    user: req.user.id,
    workout: workoutId,
    program: programId || null,
    programDay: programDay ?? null,
    exercisePerformances: exercisePerformances,
    notes: "",
    status: "in-progress"
  });

  // Return session with populated references
  const populatedSession = await WorkoutSession.findById(workoutSession._id)
    .populate(exercisePerformancePopulateConfig)
    .populate('workout')
    .populate('program');

  if (!populatedSession) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error retrieving created workout session");
  }

  res.status(StatusCodes.CREATED).json(populatedSession);
});

// @desc  Update workout session
// @route PUT /api/workout-sessions/:id
// @access Private
const updateWorkoutSession = asyncHandler(async (req, res) => {
  const workoutSession = await WorkoutSession.findById(req.params.id);

  if (!workoutSession) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Workout session not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  // Check if the session belongs to the user
  if (workoutSession.user.toString() !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Not authorized to update this workout session");
  }

  const { 
    exercisePerformances, 
    notes, 
    status,
    duration,
    completedAt
  } = req.body;

  // Prepare update data
  const updateData = {};
  if (exercisePerformances) updateData.exercisePerformances = exercisePerformances;
  if (notes !== undefined) updateData.notes = notes;
  if (status) updateData.status = status;
  if (duration !== undefined) updateData.duration = duration;
  if (status === "completed" && !completedAt) {
    updateData.completedAt = new Date();
  } else if (completedAt) {
    updateData.completedAt = completedAt;
  }

  const updatedWorkoutSession = await WorkoutSession.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate(exercisePerformancePopulateConfig)
    .populate('workout')
    .populate('program')
    .populate('user', 'name email');

  if (!updatedWorkoutSession) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error updating workout session");
  }

  // For each exercise performance, find the latest completed session with this exercise
  const enhancedExercisePerformances = await Promise.all(
    updatedWorkoutSession.exercisePerformances.map(async (performance) => {
      const exerciseId = performance.exercise._id;

      // Find the latest completed workout session that contains this exercise
      // Excluding the current session
      const latestSession = await WorkoutSession.findOne({
        user: req.user.id,
        status: 'completed',
        _id: {$ne: updatedWorkoutSession._id},
        'exercisePerformances': {
          $elemMatch: {
            'exercise': exerciseId,
            'sets': {
              $elemMatch: {
                'weight': {$gt: 0},
                'reps': {$gt: 0}
              }
            }
          }
        }
      }).sort({completedAt: -1});

      // Convert to a plain object to allow adding new properties
      const performanceObj = performance.toObject();

      if (latestSession) {
        // Find the exercise performance in the latest session
        const latestPerformance = latestSession.exercisePerformances.find(
          p => p.exercise.toString() === exerciseId.toString()
        );

        if (latestPerformance && latestPerformance.sets.length > 0) {
          // Add the historical data to the performance
          performanceObj.lastPerformance = {
            date: latestSession.completedAt,
            sessionId: latestSession._id,
            sets: latestPerformance.sets
          };
        }
      }

      return performanceObj;
    })
  );

  // Create a response object with the enhanced exercise performances
  const responseData = updatedWorkoutSession.toObject();
  responseData.exercisePerformances = enhancedExercisePerformances;

  res.status(StatusCodes.OK).json(responseData);
});

// @desc  Delete workout session
// @route DELETE /api/workout-sessions/:id
// @access Private
const deleteWorkoutSession = asyncHandler(async (req, res) => {
  const workoutSession = await WorkoutSession.findById(req.params.id);

  if (!workoutSession) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Workout session not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  // Check if the session belongs to the user
  if (workoutSession.user.toString() !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Not authorized to delete this workout session");
  }

  const deleteResult = await workoutSession.deleteOne();

  if (!deleteResult) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error deleting workout session");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getWorkoutSessions,
  getWorkoutSession,
  addWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
};

