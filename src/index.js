'use strict'

const Validator = require('./Validator')

module.exports = {
  Validator,
  createValidator(options) {
    return new Validator(options)
  },
}
