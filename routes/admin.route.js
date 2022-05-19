const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const Admin = require("../models/Admin.model");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
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
      emailToken: crypto.randomBytes(64).toString("hex"),
    });
    //// 1 = User registered
    newAdmin
      .save()
      .then((data) => res.status(200).json({ data: data, msg: 1 }))
      .catch((err) => res.status(err));

    // send email
    let mailOptions = {
      from: ' "Verify your email" <cinnakale@gmail.com>',
      to: email,
      subject: "REMS - Email Verification",
      html: `
      <h2> ${username} Thank you for choosing REMS </h2>
      <h4>Please verify your email</h4>
      <a href="http://${req.headers.host}/admin/verify?token=${newAdmin.emailToken}">Verify your Email </a>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else {
        console.log("VERIFICATION EMAIL SENT!!!");
      }
    });

    console.log(newAdmin);
  }
});

router.get("/verify", async (req, res) => {
  let token = req.query.token;
  const admin = await Admin.findOne({ emailToken: token });
  if (admin) {
    admin.verified = true;
    admin.emailToken = null;
    await admin.save();
    console.log("VERIFIEddd");
    res.redirect("/home");
  } else {
    res.redirect("/home");
  }
});

module.exports = router;
