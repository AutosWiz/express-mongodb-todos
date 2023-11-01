require("dotenv").config();
const mongoose = require("mongoose");
const Todo = require("../models/todo");

mongoose
  .connect("mongodb://localhost:27017/express-todos", {
    authSource: "admin",
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
  })
  .catch((error) => console.log(error));
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("Database connected"));

const seedDB = async () => {
  await Todo.deleteMany({});
  for (let i = 1; i < 10; i++) {
    const todo = new Todo({
      title: `todo ${i}`,
    });
    await todo.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
