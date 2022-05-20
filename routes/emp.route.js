const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const Emp = require("../models/Emp.model");
const Admin = require("../models/Admin.model");
const { response } = require("express");

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

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("yo, we need token");
  } else {
    jwt.verify(token, "helloworld", (err, data) => {
      if (err) res.json({ auth: false, msg: "fail auth" });

      req.userEmail = data.email;
      req.role = data.role;
      console.log("EMAIl: ", req.userEmail);

      console.log("ROle: ", req.role);

      next();
    });
  }
};
router.get("/allEmps", verifyJWT, async (req, res) => {
  console.log("In all Empps");
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

router.post("/register", verifyJWT, async (req, res, next) => {
  console.log("In Register");
  let { email } = req.body;

  //check user already exists or not
  const user = await Emp.findOne({ email: email });
  if (user) {
    return res.json({ msg: 0 });
  } else {
    let password = crypto.randomBytes(64).toString("hex");
    const hashPassword = await bcrypt.hash(password, 10);
    var newEmp = new Emp({
      _id: mongoose.Types.ObjectId(),
      email,
      password: hashPassword,
      username: email.split("@")[0],
    });
    newEmp
      .save()
      .then((data) => res.status(200).json({ data: data, msg: 1 }))
      .catch((err) => res.status(err));

    //send email
    // let mailOptions = {
    //   from: ' "Verify your email" <cinnakale@gmail.com>',
    //   to: email,
    //   subject: "REMS - Login Credentials",
    //   html: `
    //   <h2>Thank you for choosing REMS </h2>
    //   <h4>Following are your credentials</h4>
    //   <p>Email: ${email}</p>
    //   <p>Password: ${password}</p>
    //   <a href="http://localhost:3000/login">Login to REMS</a>`,
    // };

    // transporter.sendMail(mailOptions, (err, info) => {
    //   if (err) console.log(err);
    //   else {
    //     console.log("VERIFICATION EMAIL SENT!!!");
    //   }
    // });
  }

  // get email of admin from jwt
  // find admin
  // find user by email or _id

  let a = newEmp._id;
  try {
    Admin.findOneAndUpdate(
      { email: req.userEmail },
      {
        $push: {
          employees: a,
        },
      },
      function (error, data) {
        if (error) {
          console.log(error.message);
        } else {
          console.log(data);
        }
      }
    );
  } catch (e) {}
});

//for emp + admin
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  console.log("LOGIN: ", email, password);

  //check user already exists or not
  const Euser = await Emp.findOne({ email: email });
  const Auser = await Admin.findOne({ email: email });

  /////
  ////////
  ///////////
  //////////////

  ///////////// update desktop
  if (Euser) {
    if (await bcrypt.compare(req.body.password, Euser.password)) {
      const token = jwt.sign(
        { email: Euser.email, role: Euser.role },
        "helloworld"
      );
      return res.json({ data: Euser, msg: 1, token: token, auth: true });
    } else return res.json({ data: Euser, msg: 0 });
  }
  if (Auser) {
    if (await bcrypt.compare(password, Auser.password)) {
      const token = jwt.sign(
        { email: Auser.email, role: Auser.role },
        "helloworld"
      );
      return res.json({ data: Auser, msg: 1, token: token, auth: true });
    } else return res.json({ data: Auser, msg: 0 });
  } else {
    return res.json({ msg: 0 });
  }
});

router.delete("/deleteEmp/:id", verifyJWT, (req, res) => {
  console.log("In Delete");
  console.log(req.params.id);

  //6287fdddc66ebe2342a67bb3
});

router.put("/update", async (req, res) => {
  const { email, username, password, contact, bank } = req.body;
  console.log(email, username, password, contact, bank);
  const hashPassword = await bcrypt.hash(password, 10);
  Emp.findOneAndUpdate(
    { email: email },
    {
      username: username,
      password: hashPassword,
      updated: true,
      contact: contact,
      bankDetails: bank,
      verified: true,
    }
  )
    .then((data) => {
      res.json({ data: data, msg: 1 });
    })
    .catch((err) => res.status(err));
});

//for  both admin + emp
router.post("/reset", async (req, res) => {
  console.log("IN RESET");
  const { email } = req.body;

  const Euser = await Emp.findOne({ email: email });
  const Auser = await Admin.findOne({ email: email });
  let password = crypto.randomBytes(64).toString("hex");

  if (Euser) {
    Euser.password = password;
    Euser.save();
    let mailOptions = {
      from: ' "Reset Password" <cinnakale@gmail.com>',
      to: email,
      subject: "REMS - Reset Password",
      html: `
      <h2>Thank you for choosing REMS </h2>
      <h4>Following are your credentials</h4>
      <p>Email: ${email}</p>
      <p>Password: ${password}</p>
      <a href="http://localhost:3000/login">Login to REMS</a>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else {
        console.log("VERIFICATION EMAIL SENT!!!");
      }
    });

    res.json({ msg: 1 });
  } else if (Auser) {
    Auser.password = password;
    Auser.save();
    let mailOptions = {
      from: ' "Reset Password" <cinnakale@gmail.com>',
      to: email,
      subject: "REMS - Reset Password",
      html: `
      <h2>Thank you for choosing REMS </h2>
      <h4>Following are your credentials</h4>
      <p>Email: ${email}</p>
      <p>Password: ${password}</p>
      <a href="http://localhost:3000/login">Login to REMS</a>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else {
        console.log("VERIFICATION EMAIL SENT!!!");
      }
    });

    res.json({ msg: 1 });
  } else {
    console.log("else");
    res.json({ msg: 0 });
  }
});

//active idle time
router.post("/times", (req, res) => {
  const { email, active_time, idle_time } = req.body;
  try {
    Emp.findOneAndUpdate(
      { email: email },
      {
        $push: {
          totalTime: {
            date: Date.now(),
            activetime: active_time,
            idletime: idle_time,
          },
        },
      },
      function (error, data) {
        if (error) {
          console.log(error);
        } else {
          console.log(data);
        }
      }
    );
  } catch (e) {
    res.send(e);
  }
});

router.post("/apptime", (req, res) => {
  const { email, tt } = req.body;
  console.log(email, tt);

  try {
    Emp.findOneAndUpdate(
      { email: email },
      {
        $push: {
          appTime: {
            date: Date.now(),
            apps: JSON.parse(tt),
          },
        },
      },
      function (error, data) {
        if (error) {
          console.log(error);
        } else {
          console.log(data);
        }
      }
    );
  } catch (e) {
    res.send(e);
  }
});

router.get("/checkAuth", verifyJWT, (req, res) => {
  res.send("YO! you are authenticated, COngrats!!");
});

module.exports = router;
