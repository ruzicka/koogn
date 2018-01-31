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
    type: 'object',
    optional: [],
    properties: {},
  }

  if (obj.$schema) {
    return [obj, requireInfo]
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
    if (Array.isArray(obj[current])) { // arrays
      const [subArr, subRequireInfo] = preProcessArray(obj[current])
      acc[current] = subArr
      requireInfo.properties[current] = subRequireInfo
    } else if (!isPlainObject(obj[current]) || obj[current].$schema) { // anything other than objects and arrays
      acc[current] = obj[current]
    } else { // objects
      const [subObj, subRequireInfo] = preProcessObject(obj[current])
      acc[current] = subObj
      requireInfo.properties[current] = subRequireInfo
    }
    return acc
  }, {})

  return [filteredObj, requireInfo]
}

function preProcessArray(arr) {
  const requireInfo = {
    type: 'array',
    items: [],
  }

  const filteredArray = arr.map(arrItem => {
    if (isPlainObject(arrItem)) {
      const [filteredObj, reqInfo] = preProcessObject(arrItem)
      requireInfo.items.push(reqInfo)
      return filteredObj
    } else if (Array.isArray(arrItem)) {
      const [filteredArr, reqInfo] = preProcessArray(arrItem)
      requireInfo.items.push(reqInfo)
      return filteredArr
    }
    requireInfo.items.push(null)
    return arrItem
  })

  return [filteredArray, requireInfo]
}

function preProcess(val) {
  if (isPlainObject(val)) {
    return preProcessObject(val)
  } else if (Array.isArray(val)) {
    return preProcessArray(val)
  }
  return [val, null]
}

function setSchemaRequire(schema, requireInfo) {
  if (!requireInfo) {
    return schema
  }

  if (requireInfo.type === 'array') {
    setSchemaRequire(schema.items, requireInfo.items[0])
  }

  if (requireInfo.type === 'object') {
    requireInfo.optional.forEach(optionalProperty => {
      schema.properties[optionalProperty].required = false
    })

    Object.getOwnPropertyNames(requireInfo.properties).forEach(property => {
      setSchemaRequire(schema.properties[property], requireInfo.properties[property])
    })
  }

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

  const a = 1
  const [preProcessedExample, requireInfo] = preProcess(example)
  const schema = toJsonSchema(preProcessedExample, toJsonSchemaOptions)

  setSchemaRequire(schema, requireInfo)

  return schema
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
    const x = jsonSchemaValidate(instance, schema)
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
