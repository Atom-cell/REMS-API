const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const LZString = require("lz-string");
const base64ToImage = require("base64-to-image");
const Emp = require("../models/Emp.model");
const Admin = require("../models/Admin.model");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const Euser = await Emp.findOne({ email: email });

  if (Euser) {
    if (await bcrypt.compare(req.body.password, Euser.password)) {
      Euser.desktop = true;
      Euser.save();
      res.send("sanoppi");
    } else res.send("NOT OK");
  } else {
    res.send("NOT OK");
  }
});

router.post("/logout", async function (req, res) {
  const { email } = req.body;
  console.log("In logout", email);
  const Euser = await Emp.findOne({ email: email });

  if (Euser) {
    Euser.desktop = false;
    Euser.save();
    res.send("sanoppi");
  } else {
    res.send("NOT OK");
  }
});
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

router.post("/SS", (req, res) => {
  console.log("In SS");
  const { email, img } = req.body;

  try {
    Emp.findOneAndUpdate(
      { email: email },
      {
        $push: {
          screenshot: img,
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
  } catch (e) {
    console.log(e.message);
  }
});
module.exports = router;
