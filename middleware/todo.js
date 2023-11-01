const {todoSchema} = require('../schemas/todo')
const ExpressError = require('../utils/ExpressError')

module.exports.validateTodo = (req, res, next) => {
  const {error} = todoSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}
