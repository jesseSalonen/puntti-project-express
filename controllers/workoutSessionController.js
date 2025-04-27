const asyncHandler = require("express-async-handler");
const WorkoutSession = require("../models/workoutSessionModel");
const User = require("../models/userModel");
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
    .populate('user', 'name email');

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
    throw new Error("Workout session not found");
  }

  // Check if the session belongs to the user
  if (workoutSession.user._id.toString() !== req.user.id) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("Not authorized to access this workout session");
  }

  res.status(StatusCodes.OK).json(workoutSession);
});

// @desc  Add workout session
// @route POST /api/workout-sessions
// @access Private
const addWorkoutSession = asyncHandler(async (req, res) => {
  const { 
    workout, 
    program, 
    programDay, 
    exercisePerformances, 
    notes 
  } = req.body;

  if (!workout) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Please provide a workout");
  }

  // Create the workout session
  const workoutSession = await WorkoutSession.create({
    user: req.user.id,
    workout,
    program: program || null,
    programDay: programDay || null,
    exercisePerformances: exercisePerformances || [],
    notes: notes || "",
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
    .populate('program');

  if (!updatedWorkoutSession) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error updating workout session");
  }

  res.status(StatusCodes.OK).json(updatedWorkoutSession);
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

// @desc  Get user's recent program and standalone workout sessions
// @route GET /api/workout-sessions/user/recent
// @access Private
const getUserRecentWorkoutSessions = asyncHandler(async (req, res) => {
  // Convert user ID string to mongoose ObjectId
  const userId = new Types.ObjectId(req.user.id);
  
  // Find the user with their subscribed programs
  const user = await User.findById(req.user.id)
    .populate('subscribedPrograms.program');
  
  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("User not found");
  }
  
  // Get all subscribed program IDs
  const subscribedProgramIds = user.subscribedPrograms.map(sub => sub.program._id);
  
  // 1. Find the program sessions
  const programSessionsAggregation = await WorkoutSession.aggregate([
    {
      $match: {
        user: userId,
        program: { $in: subscribedProgramIds }
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: "$program",
        sessionId: { $first: "$_id" },
      }
    }
  ]);
  
  // 2. Find the standalone workout sessions (without program link)
  const standaloneSessionsAggregation = await WorkoutSession.aggregate([
    {
      $match: {
        user: userId,
        program: null
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: "$workout",
        sessionId: { $first: "$_id" },
      }
    },
    {
      $limit: 2 // Get only the two most recent standalone workouts
    }
  ]);
  
  // Extract the session IDs from each type
  const programSessionIds = programSessionsAggregation.map(session => 
    new Types.ObjectId(session.sessionId)
  );
  
  const standaloneSessionIds = standaloneSessionsAggregation.map(session => 
    new Types.ObjectId(session.sessionId)
  );
  
  // Fetch complete program session documents with population
  const programSessions = await WorkoutSession.find({
    _id: { $in: programSessionIds }
  })
  .populate('workout')
  .populate({
    path: 'workout',
    populate: {
      path: 'exercises.exercise',
      populate: {
        path: 'muscles'
      }
    }
  })
  .populate('program')
  .sort({ createdAt: -1 });
  
  // Fetch complete standalone session documents with population
  const standaloneSessions = await WorkoutSession.find({
    _id: { $in: standaloneSessionIds }
  })
  .populate('workout')
  .populate({
    path: 'workout',
    populate: {
      path: 'exercises.exercise',
      populate: {
        path: 'muscles'
      }
    }
  })
  .sort({ createdAt: -1 });
  
  // Return both types of sessions in separate arrays
  res.status(StatusCodes.OK).json({
    programSessions,
    standaloneSessions
  });
});

module.exports = {
  getWorkoutSessions,
  getWorkoutSession,
  addWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
  getUserRecentWorkoutSessions,
};

