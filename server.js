const express = require("express");
var createError = require("http-errors");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
const PORT = 5000;
const adminRouter = require("./routes/admin.route");

const server = http.createServer(app);
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/REMSruff", (err) => {
  if (err) throw err;
  console.log("DB connected");
});

app.use(cors());
app.use(express.json());

app.use("/admin", adminRouter);

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

app.listen(process.env.PORT || 5000, () => {
  console.log("Server online at ", PORT);
});
