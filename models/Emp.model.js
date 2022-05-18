var mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Define a schema
var empSchema = mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: "https://i.stack.imgur.com/34AD2.jpg",
  },
  role: {
    type: String,
    default: "Employee",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  desktop: Boolean,
  status: Boolean,
  totalTime: [
    {
      date: Date,
      activetime: Schema.Types.Mixed,
      idletime: Schema.Types.Mixed,
    },
  ],
  appTime: [
    {
      date: Date,
      apps: Schema.Types.Mixed,
    },
  ],
  flag: String,
  screenshot: [
    {
      type: String,
    },
  ],
  billingId: String, // This is Stripe Customer ID
});

module.exports = mongoose.model("employee", empSchema);