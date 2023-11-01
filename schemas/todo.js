const Joi = require('joi')

module.exports.todoSchema = Joi.object({
  todo: Joi.object({
    title: Joi.string().required()
  }).required()
})