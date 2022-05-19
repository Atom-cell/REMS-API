const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
    },
    profilePicture: {
      String,
    },
    role: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },

    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "myEmployee" }],
    blockSites: [
      {
        siteName: String,
        address: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
