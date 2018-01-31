'use strict'

const isPlainObject = require('lodash.isplainobject')

const customFnc = (obj, defaultFnc) => obj.$schema || defaultFnc(obj)
const requireOverrideFnc = (schema, obj, defaultFunc) => { // prevents override of required field in $schemas
  if (isPlainObject(obj) && obj.$schema) {
    return schema
  }
  return defaultFunc(schema)
}


const defaultValidatorOptions = {
  arrays: {
    mode: 'all',
  },
  strings: {
    formatDetectionMode: 'both', // none|name|content|both
  },
  objects: {
    additionalProperties: false,
  },
}

const stringFormats = [
  'date-time',
  'ip-address',
  'host-name',
  'utc-millisec',
  'date',
  'time',
  'email',
  'ipv6',
  'ipv4', // same as 'ip-address'
  'uri',
  'color',
  'hostname',
  'alpha',
  'alphanumeric',
  'regex',
  'style',
  'phone',
]

function stringsCustomFunction(value, defaultFnc) {
  if (stringFormats.indexOf(value) >= 0) {
    return {type: 'string', format: value}
  }
  return defaultFnc(value)
}

function getValidatorOptions(userOptions) {
  return {
    arrays: {...defaultValidatorOptions.arrays, ...userOptions.arrays},
    strings: {...defaultValidatorOptions.strings, ...userOptions.strings},
    objects: {...defaultValidatorOptions.objects, ...userOptions.objects},
  }
}

function convertToToJsonSchemaOptions(validatorOptions) {
  const {formatDetectionMode} = validatorOptions.strings
  const stringsDetectFormat = formatDetectionMode === 'both' || formatDetectionMode === 'content'
  const toJsonSchemaOptions = {
    arrays: {
      mode: validatorOptions.arrays.mode,
    },
    strings: {
      detectFormat: stringsDetectFormat,
    },
    required: true,
    objects: {
      customFnc,
      requireOverrideFnc,
      additionalProperties: validatorOptions.objects.additionalProperties,
    },
  }

  if (formatDetectionMode === 'both' || formatDetectionMode === 'name') {
    toJsonSchemaOptions.strings.customFnc = stringsCustomFunction
  }

  return toJsonSchemaOptions
}

module.exports = {
  getValidatorOptions,
  convertToToJsonSchemaOptions,
}
