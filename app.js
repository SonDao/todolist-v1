const express = require("express");
const bodyParser = require("body-parser");
const port = 3000;
const date = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// tell app to use ejs
app.set('view engine', 'ejs');
var items = [];

app.post("/", function(req, res) {
  var item = req.body.inputText;
  console.log(item);
  items.push(item);
  res.redirect("/");
});

app.listen(port, function() {
  console.log("server is listening at port: " + port);
});

app.get("/", function(req, res) {
  var day = date.getDate();

  res.render("list", {
    kindOfDay: day,
    thingsToDo: items
  });
});
