const express = require("express");
var createError = require("http-errors");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").createServer(app);
const PORT = 5000;
const adminRouter = require("./routes/admin.route");
const empRouter = require("./routes/emp.route");
const desktopRouter = require("./routes/desktop.route");
const io = require("socket.io")(http);
let sock = {};

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/REMSruff", (err) => {
  if (err) throw err;
  console.log("DB connected");
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("New client is connected");

  //send to client

  // socket.emit("welcome", `Hello there!! ${socket.id}`);
  //socket.emit("serv", "hi client");
  //socket.emit("code", "2216");

  socket.on("Email", (data) => {
    sock[data] = socket.id;
    console.log("SOCKET EMAIL", data, " : ", sock[data]);
  });

  console.log("ID ", socket.id);
  // sock["sani"] = socket.id;

  //receive from client
  socket.on("sending", (data) => {
    socket.send("hdhdhd");
    console.log("Yo! ", data);
  });

  io.to(socket.id).emit("Ex", `Exclusive Message ${Math.random(100)}`);

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
    //delete socket[]
  });

  socket.on("fromCLIENT", (data) => {
    console.log("DATA: ", data);
  });
});

// from web visit this route, then on utility it will emit. front se email send. idher email se sock mai se id nikalo or emit krdo usko
app.get("/start/:mail", (req, res) => {
  console.log(req.params.mail);

  let a = sock[req.params.mail];
  console.log("Sending START signal to turn ON SS", a);
  io.to(a).emit("SSStart", "true");
  res.send("hello ");
});

app.get("/stop/:mail", (req, res) => {
  const email = req.params.mail;
  console.log(email);
  let e = email;
  let a = sock[e];
  console.log("Sending STOP signal to turn OFF SS", a);
  io.to(a).emit("SSStop", "true");
  res.send("hello ");
});

app.use("/admin", adminRouter);
app.use("/emp", empRouter);
app.use("/desk", desktopRouter);

http.listen(process.env.PORT || 5000, () => {
  console.log("Server online at ", PORT);
});

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });
