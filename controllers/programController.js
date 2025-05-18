const asyncHandler = require("express-async-handler");
const Program = require("../models/programModel");
const User = require("../models/userModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");
const WorkoutSession = require("../models/workoutSessionModel");
const {Types} = require('mongoose');

// Deep populate configuration for workouts and their nested data
const workoutPopulateConfig = {
  path: 'schedule.workout',
  populate: {
    path: 'exercises.exercise',
    populate: {
      path: 'muscles'
    }
  }
};

// @desc  Get programs
// @route GET /api/programs
// @access Private
const getPrograms = asyncHandler(async (req, res) => {
  const programs = await Program.find({})
    .populate(workoutPopulateConfig)
    .populate('user', 'name email');

  res.status(StatusCodes.OK).json(programs);
});

// @desc  Get program
// @route GET /api/programs/:id
// @access Private
const getProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id)
    .populate(workoutPopulateConfig)
    .populate('user', 'name email');

  if (!program) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Program not found");
  }

  res.status(StatusCodes.OK).json(program);
});

// @desc  Add program
// @route POST /api/programs
// @access Private
const addProgram = asyncHandler(async (req, res) => {
  const { name, description, schedule } = req.body;

  // Validate schedule data if present
  if (schedule && !Array.isArray(schedule)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Schedule must be an array");
  }

  // Create the program
  const program = await Program.create({
    name,
    description: description || "",
    user: req.user.id,
    schedule: schedule || []
  });

  // Return program with populated workout references
  const populatedProgram = await Program.findById(program._id)
    .populate(workoutPopulateConfig);

  if (!populatedProgram) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error retrieving created program");
  }

  res.status(StatusCodes.CREATED).json(populatedProgram);
});

// @desc  Update program
// @route PUT /api/programs/:id
// @access Private
const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Program not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  const { name, description, schedule } = req.body;

  // Validate schedule data if present
  if (schedule && !Array.isArray(schedule)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Schedule must be an array");
  }

  // Prepare update data - only include fields that are provided
  const updateData = {
    name,
    description
  };

  if (schedule) updateData.schedule = schedule;

  const updatedProgram = await Program.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate(workoutPopulateConfig);

  if (!updatedProgram) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error retrieving updated program");
  }

  res.status(StatusCodes.OK).json(updatedProgram);
});

// @desc  Delete program
// @route DELETE /api/programs/:id
// @access Private
const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Program not found");
  }

  // Check for user
  if (!req.user) {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("User not found");
  }

  const deleteResult = await program.deleteOne();

  if (!deleteResult) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error deleting program");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getPrograms,
  getProgram,
  addProgram,
  updateProgram,
  deleteProgram,
};