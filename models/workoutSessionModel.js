const mongoose = require("mongoose");

// This schema represents a single exercise performance within a workout session
const exercisePerformanceSchema = mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Exercise"
  },
  sets: [{
    weight: {
      type: Number,
      default: 0
    },
    reps: {
      type: Number,
      default: 0
    },
    dropSet: {
      type: Boolean,
      default: false
    },
    restPause: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ""
    }
  }]
});

const workoutSessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Workout"
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program"
    },
    programDay: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress"
    },
    exercisePerformances: [exercisePerformanceSchema],
    notes: {
      type: String,
      default: ""
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);