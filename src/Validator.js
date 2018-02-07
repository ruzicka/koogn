'use strict'

const isPlainObject = require('lodash.isplainobject')
const jsonSchemaValidate = require('jsonschema').validate
const toJsonSchema = require('to-json-schema')
const {ValidationError, InvalidExampleError} = require('./errors')
const {getValidatorOptions, convertToToJsonSchemaOptions} = require('./config')

function formatErrors(errors) {
  return errors.map(item =>
    `${item.property.replace('instance.', 'Parameter ')} ${item.message}`).join(';')
}

function getAndValidateRequiredOptionalProps(arr, obj) {
  const props = Array.isArray(arr) ? arr : [arr]
  props.forEach(prop => {
    if (typeof prop !== 'string') {
      throw new InvalidExampleError('$required/$optional fields may contain only `string` values')
    }
    if (typeof obj[prop] === 'undefined') {
      throw new InvalidExampleError('$required/$optional fields may contain only properties existing in the example object')
    }
  })
  return props
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
    const requiredProps = getAndValidateRequiredOptionalProps(obj.$required, obj)
    requireInfo.optional = Object.getOwnPropertyNames(obj)
      .filter(property => requiredProps.indexOf(property) < 0 && property !== '$required' && property !== '$optional')
  } else if (optionalExists) {
    const optionalProps = getAndValidateRequiredOptionalProps(obj.$optional, obj)
    requireInfo.optional = optionalProps.filter(property => property !== '$required' && property !== '$optional')
  }

  const filteredObj = Object.getOwnPropertyNames(obj).reduce((acc, current) => {
    if (current === '$required' || current === '$optional') {
      return acc
    }
    if (Array.isArray(obj[current])) { // arrays
      const [subArr, subRequireInfo] = preProcessArray(obj[current]) // eslint-disable-line no-use-before-define
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

  const newSchema = {...schema}
  if (requireInfo.type === 'array' && newSchema.items) {
    newSchema.items = setSchemaRequire(newSchema.items, requireInfo.items[0])
  }

  if (requireInfo.type === 'object' && newSchema.properties) {
    newSchema.properties = {...newSchema.properties}
    requireInfo.optional.forEach(optionalProperty => {
      if (newSchema.properties[optionalProperty]) {
        newSchema.properties[optionalProperty] = {...newSchema.properties[optionalProperty], required: false}
      }
    })

    Object.getOwnPropertyNames(requireInfo.properties).forEach(propName => {
      if (newSchema.properties[propName]) {
        newSchema.properties[propName] = {...setSchemaRequire(newSchema.properties[propName], requireInfo.properties[propName])}
      }
    })
  }

  return newSchema
}

function getSchemaStandalone(example, toJsonSchemaOptions) {
  const [preProcessedExample, requireInfo] = preProcess(example)
  const schema = toJsonSchema(preProcessedExample, toJsonSchemaOptions)

  return setSchemaRequire(schema, requireInfo)
}

class Validator {
  constructor(options = {}) {
    this.options = getValidatorOptions(options)
    this.toJsonSchemaOptions = convertToToJsonSchemaOptions(this.options)
  }

  getSchema(example) {
    return getSchemaStandalone(example, this.toJsonSchemaOptions)
  }

  validate(example, instance) {
    if (typeof example === 'undefined') {
      throw new InvalidExampleError()
    }
    const schema = this.getSchema(example)
    return jsonSchemaValidate(instance, schema)
  }

  isValid(example, instance) {
    return this.validate(example, instance).errors.length === 0
  }

  throwIfNotValid(example, instance) {
    const res = this.validate(example, instance)
    if (res.errors.length > 0) {
      throw new ValidationError(formatErrors(res.errors))
    }
  }
}

module.exports = Validator
