const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const Admin = require("../models/Admin.model");
const Emp = require("../models/Emp.model");
const Activity = require("../models/Activity.model");

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("yo, we need token");
  } else {
    jwt.verify(token, "helloworld", (err, data) => {
      if (err) res.json({ auth: false, msg: "fail auth" });

      req.userEmail = data.email;
      req.role = data.role;
      //console.log("EMAIl: ", req.userEmail);

      //console.log("ROle: ", req.role);

      next();
    });
  }
};
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
    res.redirect("http://localhost:3000/home");
  } else {
    res.redirect("http://localhost:3000/home");
  }
});

router.get("/allEmps", verifyJWT, async (req, res) => {
  //console.log("In all Empps");
  try {
    Admin.find({ email: req.userEmail })
      .populate("employees")
      .exec(function (err, data) {
        if (err) console.log(err.message);
        res.json({ msg: 1, data: data[0].employees });
      });
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/logs/:email", verifyJWT, async (req, res) => {
  console.log("In Logs", req.params.email);

  Activity.find({ email: req.params.email }).then((response) => {
    res.json({ data: response });
  });
});
router.get("/aa", async (req, res) => {
  res.redirect("http://localhost:3000/home");
});

router.post("/postlog", (req, res) => {
  let a = new Activity({
    email: "zzzzzz099999@gmail.com",
    app: "aasada",
    time: "999:999:999",
  });
  a.save().then((response) => {
    res.send("OK");
  });
});
module.exports = router;
