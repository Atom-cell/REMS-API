const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Emp = require("../models/Emp.model");
const Admin = require("../models/Admin.model");

router.post("/register", async (req, res, next) => {
  let { username, email, password } = req.body;

  //check user already exists or not
  const user = await Emp.findOne({ email: email });
  if (user) {
    return res.json({ msg: 0 });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  let newEmp = new Emp({
    username,
    email,
    password: hashPassword,
  });
  newEmp
    .save()
    .then((data) => res.status(200).json({ data: data, msg: 1 }))
    .catch((err) => res.status(err));
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  console.log(email, password);

  //check user already exists or not
  const Euser = await Emp.findOne({ email: email });
  const Auser = await Admin.findOne({ email: email });

  if (Euser) {
    if (await bcrypt.compare(req.body.password, Euser.password)) {
      return res.json({ data: Euser, msg: 1 });
    } else return res.json({ data: Euser, msg: 0 });
  }
  if (Auser) {
    if (await bcrypt.compare(password, Auser.password)) {
      return res.json({ data: Auser, msg: 1 });
    } else return res.json({ data: Euser, msg: 0 });
  } else {
    return res.json({ msg: 0 });
  }

  // if (user) {
  //   //password match
  //   if(bcrypt.compare(password, user.password)){
  //     return res.json({ msg: 1 });
  //   }
  //   else{
  //     //password wrong
  //     return res.json({ msg: 0 });
  //   }
  // }
  // else{
  //   //0 = user not regsistered
  //   return res.json({msg:0})
  // }
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

module.exports = router;
