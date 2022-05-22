const mongoose = require("mongoose");

const activitySchema = mongoose.Schema({
  email: { type: "string" },
  app: { type: "string" },
  time: { type: "string" },
});

module.exports = mongoose.model("Activity", activitySchema);
