const express = require("express");
const {
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/ExerciseController");
const router = express.Router();

// Exercises
router.route("/exercises").get(getExercises).post(addExercise);
router.route("/exercises/:id").put(updateExercise).delete(deleteExercise);

module.exports = router;
