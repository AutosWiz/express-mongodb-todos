const express = require("express");
const router = express.Router();
const { validateTodo } = require('../middleware/todo')

const catchAsync = require("../utils/catchAsync");
const { renderNewForm, index, createTodo, showTodo, renderEditForm, updateTodo, deleteTodo } = require("../controllers/todos");

router.route("/")
  .get(catchAsync(index))
  .post(validateTodo, catchAsync(createTodo));

router.get("/new", renderNewForm);

router.route("/:id")
  .get(catchAsync(showTodo))
  .put(validateTodo, catchAsync(updateTodo))
  .delete(catchAsync(deleteTodo));

router.get("/:id/edit", catchAsync(renderEditForm));

module.exports = router;
