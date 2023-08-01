const mongoose = require("mongoose");

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
    workouts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Program", programSchema);
