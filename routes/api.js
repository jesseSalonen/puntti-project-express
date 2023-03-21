const express = require("express");
const router = express.Router();
const {
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/ExerciseController");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/UserController");

// Exercises
router.route("/exercises").get(getExercises).post(addExercise);
router.route("/exercises/:id").put(updateExercise).delete(deleteExercise);

// Users
router.post("/users", registerUser);
router.post("/users/login", loginUser);
router.get("/users/me", getMe);

module.exports = router;
