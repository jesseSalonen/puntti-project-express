const mongoose = require("mongoose");

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
        exercises: [
          {
            exercise: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Exercise",
            },
            setAmount: {
              type: Number,
              required: true,
            },
            sets: [
              {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Set",
              },
            ],
          },
        ],
        description: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workout", workoutSchema);
