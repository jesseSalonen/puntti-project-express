const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/exerciseController");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");

// Exercises
router
  .route("/exercises")
  .get(protect, getExercises)
  .post(protect, addExercise);
router
  .route("/exercises/:id")
  .put(protect, updateExercise)
  .delete(protect, deleteExercise);

// Users
router.post("/users", registerUser);
router.post("/users/login", loginUser);
router.get("/users/me", protect, getMe);

module.exports = router;
