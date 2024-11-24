const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
  getExercise,
} = require("../controllers/exerciseController");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");
const {
  getMuscles,
  addMuscle,
  updateMuscle,
  deleteMuscle,
} = require("../controllers/muscleController");
const {
  getWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
} = require("../controllers/workoutController");
const { getPrograms, addProgram } = require("../controllers/programController");

// Exercises
router
  .route("/exercises")
  .get(protect, getExercises)
  .post(protect, addExercise);
router
  .route("/exercises/:id")
  .get(protect, getExercise)
  .put(protect, updateExercise)
  .delete(protect, deleteExercise);

// Workouts
router.route("/workouts").get(protect, getWorkouts).post(protect, addWorkout);
router
  .route("/workouts/:id")
  .put(protect, updateWorkout)
  .delete(protect, deleteWorkout);

// Programs
router.route("/programs").get(protect, getPrograms).post(protect, addProgram);
router.route;

// Users
router.post("/users", registerUser);
router.post("/users/login", loginUser);
router.get("/users/me", protect, getMe);

// Muscles
router.route("/muscles").get(protect, getMuscles).post(protect, addMuscle);
router
  .route("/muscles/:id")
  .put(protect, updateMuscle)
  .delete(protect, deleteMuscle);

module.exports = router;
