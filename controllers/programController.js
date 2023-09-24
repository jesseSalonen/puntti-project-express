const asyncHandler = require("express-async-handler");
const Program = require("../models/programModel");
const User = require("../models/userModel");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");

// @desc  Get programs
// @route GET /api/programs
// @access Private
const getPrograms = asyncHandler(async (req, res) => {
  try {
    const programs = await Program.find({}).populate("workouts");
    res.status(StatusCodes.OK).json(programs);
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error getting programs");
  }
});

// @desc  Add program
// @route POST /api/programs
// @access Private
const addProgram = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("No name field in request");
  }

  try {
    const program = await Program.create({
      name: req.body.name,
      description: req.body.description,
      user: req.user.id,
      workouts: req.body.programWorkouts,
    });
    res.status(StatusCodes.OK).json(program);
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Error adding program");
  }
});

// @desc  Update program
// @route PUT /api/programs/:id
// @access Private
const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Program not found");
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

  const updatedProgram = await Program.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedProgram) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to update program");
  }
  res.status(StatusCodes.OK).json(updatedProgram);
});

// @desc  Delete program
// @route DELETE /api/programs/:id
// @access Private
const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Program not found");
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
  const deleteCount = await program.deleteOne();

  if (!deleteCount) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Failed to delete program");
  }

  res.status(StatusCodes.OK).json({ id: req.params.id });
});

module.exports = {
  getPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
};
