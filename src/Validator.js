'use strict'

const jsonSchemaValidate = require('jsonschema').validate
const toJsonSchema = require('to-json-schema')
const ValidationError = require('./ValidationError')
const {getValidatorOptions, convertToToJsonSchemaOptions} = require('./config')

function formatErrors(errors) {
  return errors.map(item =>
		`${item.property.replace('instance.', 'Parameter ')} ${item.message}`
	).join(';')
}

class Validator {
  constructor(options = {}) {
    this.options = getValidatorOptions(options)
    this.toJsonSchemaOptions = convertToToJsonSchemaOptions(this.options)
  }

  validate(instance, example) {
    if (typeof example === 'undefined') {
      throw new ValidationError('Invalid example')
    }
    const schema = toJsonSchema(example, this.toJsonSchemaOptions)
    return jsonSchemaValidate(instance, schema)
  }

  isValid(instance, example) {
    return this.validate(instance, example).errors.length === 0
  }

  throwIfNotValid(instance, notJsonSchema) {
    const res = this.validate(instance, notJsonSchema)
    if (res.errors.length > 0) {
      throw new ValidationError(formatErrors(res.errors))
    }
  }
}

module.exports = Validator
