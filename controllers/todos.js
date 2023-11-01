const Todo = require("../models/todo");

module.exports.index = async (req, res) => {
  const todos = await Todo.find({});
  res.render("todos/index", { todos });
};

module.exports.renderNewForm = (req, res) => {
  res.render("todos/new");
};

module.exports.createTodo = async (req, res) => {
  const todo = new Todo(req.body.todo);
  await todo.save()
  req.flash('success', 'Successfully made a new todo!')
  res.redirect(`/todos/${todo._id}`);
};

module.exports.showTodo = async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findById(id);
  if (!todo) {
    req.flash('error', 'Cannot find that todo!')
    return res.redirect('/todos')
  }
  res.render("todos/show", { todo });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findById(id);
  if (!todo) {
    req.flash('error', 'Cannot find that todo!')
    return res.redirect('/todos')
  }
  res.render("todos/edit", { todo });
};

module.exports.updateTodo = async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findByIdAndUpdate(id, { ...req.body.todo });
  await todo.save();
  req.flash('success', 'Successfully updated todo!')
  res.redirect(`/todos/${todo._id}`);
};

module.exports.deleteTodo = async (req, res) => {
  const { id } = req.params;
  await Todo.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted todo')
  res.redirect("/todos");
};
