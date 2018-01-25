'use strict'

const merge = require('lodash.merge')

const customFnc = (obj, defaultFnc) => obj.$schema || defaultFnc(obj)

const defaultValidatorOptions = {
  arrays: {
    mode: 'all',
  },
  strings: {
    formatDetectionMode: 'both', // none|name|content|both
  },
  objects: {
    customFnc,
  }
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
  return merge({}, defaultValidatorOptions, userOptions)
}

function convertToToJsonSchemaOptions(validatorOptions) {
  const {formatDetectionMode} = validatorOptions.strings
  const stringsDetectFormat = formatDetectionMode === 'both' || formatDetectionMode === 'content'
  const toJsonSchemaOptions = {
    ...validatorOptions,
    strings: {
      detectFormat: stringsDetectFormat
    },
    required: true,
  }

  if (formatDetectionMode === 'both' || formatDetectionMode === 'name') {
    toJsonSchemaOptions.strings.customFnc = stringsCustomFunction
  }

  return toJsonSchemaOptions
}

module.exports = {
  getValidatorOptions,
  convertToToJsonSchemaOptions
}
