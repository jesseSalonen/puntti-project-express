const mongoose = require("mongoose");

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

module.exports = mongoose.model("Set", setSchema);
