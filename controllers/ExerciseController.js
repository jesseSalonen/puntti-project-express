const asyncHandler = require("express-async-handler");
const Exercise = require("../models/exerciseModel");

// @desc  Get exercises
// @route GET /api/exercises
// @access Private
const getExercises = asyncHandler(async (req, res) => {
  const exercises = await Exercise.find();
  res.status(200).json(exercises);
});

// @desc  Add exercise
// @route POST /api/exercises
// @access Private
const addExercise = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(400);
    throw new Error("Please add a name field");
  }

  const exercise = await Exercise.create({
    name: req.body.name,
  });
  res.status(200).json(exercise);
});

// @desc  Update exercise
// @route PUT /api/exercises/:id
// @access Private
const updateExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    res.status(400);
    throw new Error("Exercise not found");
  }

  const updatedExercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updatedExercise);
});

// @desc  Delete exercise
// @route DELETE /api/exercises/:id
// @access Private
const deleteExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    res.status(400);
    throw new Error("Exercise not found");
  }
  await exercise.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
};
