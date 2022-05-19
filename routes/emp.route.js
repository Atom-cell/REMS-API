const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const Emp = require("../models/Emp.model");
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
  let { email } = req.body;

  //check user already exists or not
  const user = await Emp.findOne({ email: email });
  if (user) {
    return res.json({ msg: 0 });
  } else {
    let password = crypto.randomBytes(64).toString("hex");
    const hashPassword = await bcrypt.hash(password, 10);
    let newEmp = new Emp({
      email,
      password: hashPassword,
    });
    newEmp
      .save()
      .then((data) => res.status(200).json({ data: data, msg: 1 }))
      .catch((err) => res.status(err));

    let mailOptions = {
      from: ' "Verify your email" <cinnakale@gmail.com>',
      to: email,
      subject: "REMS - Login Credentials",
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
  }
});

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
router.get("/checkAuth", verifyJWT, (req, res) => {
  res.send("YO! you are authenticated, COngrats!!");
});

module.exports = router;
