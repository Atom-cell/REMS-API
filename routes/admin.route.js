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
    // 0 = User already exists
    return res.json({ msg: 0 });
  } else {
    const hashPassword = await bcrypt.hash(password, 5);
    let newAdmin = new Admin({
      username,
      email,
      password: hashPassword,
      role: "admin",
    });
    //// 1 = User registered
    newAdmin
      .save()
      .then((data) => res.status(200).json({ data: data, msg: 1 }))
      .catch((err) => res.status(err));

    console.log(newAdmin);
  }
});

module.exports = router;
