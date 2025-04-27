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
  deleteWorkout, getWorkout,
} = require("../controllers/workoutController");
const { getPrograms, addProgram, updateProgram, deleteProgram, getProgram} = require("../controllers/programController");
const {sendEmail} = require('../controllers/mailController');
const {
  getWorkoutSessions,
  getWorkoutSession,
  getUserRecentWorkoutSessions,
  addWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
} = require("../controllers/workoutSessionController");

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
  .get(protect, getWorkout)
  .put(protect, updateWorkout)
  .delete(protect, deleteWorkout);

// Programs
router.route("/programs").get(protect, getPrograms).post(protect, addProgram);
router
  .route("/programs/:id")
  .get(protect, getProgram)
  .put(protect, updateProgram)
  .delete(protect, deleteProgram);

// Workout Sessions
router
  .route("/workout-sessions")
  .get(protect, getWorkoutSessions)
  .post(protect, addWorkoutSession);
router.route("/workout-sessions/recent").get(protect, getUserRecentWorkoutSessions);
router
  .route("/workout-sessions/:id")
  .get(protect, getWorkoutSession)
  .put(protect, updateWorkoutSession)
  .delete(protect, deleteWorkoutSession);

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

// Email
router.post("/send-email", sendEmail);

module.exports = router;
