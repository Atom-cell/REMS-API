const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Admin = require("../models/Admin.model");

router.post("/register", async (req, res, next) => {
  let { username, email, password } = req.body;

  //check user already exists or not
  const user = await Admin.findOne({ email: email });
  if (user) {
    return res.json({ msg: "User already exists" });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  let newAdmin = new Admin({
    username,
    email,
    password: hashPassword,
    role: "admin",
  });
  newAdmin
    .save()
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(err));
});

module.exports = router;
