const mongoose = require("mongoose");

// Define schedule item schema for program
const scheduleItemSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ['workout', 'rest'],
    required: true
  },
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workout",
    // Only required if type is 'workout'
    required: function() {
      return this.type === 'workout';
    }
  }
});

const programSchema = mongoose.Schema(
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
    schedule: [scheduleItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Program", programSchema);
