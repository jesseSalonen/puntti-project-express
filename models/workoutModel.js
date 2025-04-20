const mongoose = require("mongoose");

// Define set schema inline (no separate model needed)
const setSchema = mongoose.Schema({
  reps: {
    type: Number,
    default: null,
  },
  dropSet: {
    type: Boolean,
    default: false,
  },
  restPause: {
    type: Boolean,
    default: false,
  },
});

const workoutSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name value"],
    },
    description: {
      type: String,
      default: "",
    },
    exercises: [
      {
        exercise: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
        },
        sets: [setSchema], // Embed sets directly using the schema
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workout", workoutSchema);