'use strict'

const isPlainObject = require('lodash.isplainobject')
const jsonSchemaValidate = require('jsonschema').validate
const toJsonSchema = require('to-json-schema')
const ValidationError = require('./ValidationError')
const {getValidatorOptions, convertToToJsonSchemaOptions} = require('./config')

function formatErrors(errors) {
  return errors.map(item =>
    `${item.property.replace('instance.', 'Parameter ')} ${item.message}`).join(';')
}

function preProcessObject(obj) {
  const requireInfo = {
    optional: [],
    properties: {},
  }

  const requiredExists = Boolean(obj.$required)
  const optionalExists = Boolean(obj.$optional)

  if (requiredExists) {
    const requiredProps = Array.isArray(obj.$required) ? obj.$required : [obj.$required]
    requireInfo.optional = Object.getOwnPropertyNames(obj)
      .filter(property => requiredProps.indexOf(property) < 0 && property !== '$required' && property !== '$optional')
  } else if (optionalExists) {
    const optionalProps = Array.isArray(obj.$optional) ? obj.$optional : [obj.$optional]
    requireInfo.optional = optionalProps.filter(property => property !== '$required' && property !== '$optional')
  }

  const filteredObj = Object.getOwnPropertyNames(obj).reduce((acc, current) => {
    if (current === '$required' || current === '$optional') {
      return acc
    }
    if (!isPlainObject(obj[current]) || obj[current].$schema) {
      acc[current] = obj[current]
    } else {
      const [subObj, subRequireInfo] = preProcessObject(obj[current])
      acc[current] = subObj
      requireInfo.properties[current] = subRequireInfo
    }
    return acc
  }, {})

  return [filteredObj, requireInfo]
}

function setSchemaRequire(schema, requireInfo) {

  requireInfo.optional.forEach(optionalProperty => {
    schema.properties[optionalProperty].required = false
  })

  Object.getOwnPropertyNames(requireInfo.properties).forEach(property => {
    setSchemaRequire(schema.properties[property], requireInfo.properties[property])
  })

  return schema
}

function getSchema(example, toJsonSchemaOptions) {

  // const example1 = {
  //   id: 1,
  //   author: {
  //     firstName: 'John',
  //     lastName: 'Smith',
  //     phones: {$schema: {type: 'array', items: {type: 'string'}}},
  //     $required: ['lastName'],
  //   },
  //   labels: {$schema: {type: 'array', items: {type: 'string'}}},
  //   $required: ['id', 'author'],
  // }

  // const req = {
  //   required: ['id', 'author']
  //   optional: ['labels']
  //   author: {
  //
  //   }
  //
  //   id: true,
  //   author: true
  // }
  //
  //
  // const schema = toJsonSchema(example, toJsonSchemaOptions)
  //
  // return schema

  const [preProcessedExample, requireInfo] = preProcessObject(example)
  const schema = toJsonSchema(preProcessedExample, toJsonSchemaOptions)

  const x = setSchemaRequire(schema, requireInfo)
  return x
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
    const schema = getSchema(example, this.toJsonSchemaOptions)
    const x =  jsonSchemaValidate(instance, schema)
    return x
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
