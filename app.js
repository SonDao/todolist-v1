const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = 3000;
// const date = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// tell app to use ejs
app.set('view engine', 'ejs');
// var items = [];
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model('item', itemsSchema);

const List = mongoose.model('list', listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item!"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];

app.post("/", function(req, res) {
  const itemName = req.body.inputText;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  console.log(checkedItemID);
  console.log(listName);

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted the item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}}, function(err, foundList) {
        if(!err){
          res.redirect("/" + listName);
        }
    })
  }
});


app.listen(port, function() {
  console.log("server is listening at port: " + port);
});

app.get("/", function(req, res) {
  // var day = date.getDate();
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {
        listTitle: "Today",
        thingsToDo: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList) {
  if (err) {
    console.log(err);
  }
  else {
    if (!foundList){
      // create a new list
      const list = new List({
        name: customListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/" + customListName);
    }
    else {
      // show and existing list
      res.render("list", {
        listTitle: foundList.name,
        thingsToDo: foundList.items
      });
    }
  }
});
});
