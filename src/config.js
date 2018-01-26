'use strict'

const customFnc = (obj, defaultFnc) => obj.$schema || defaultFnc(obj)

const defaultValidatorOptions = {
  arrays: {
    mode: 'all',
  },
  strings: {
    formatDetectionMode: 'both', // none|name|content|both
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
    arrays: Object.assign({}, defaultValidatorOptions.arrays, userOptions.arrays),
    strings: Object.assign({}, defaultValidatorOptions.strings, userOptions.strings),
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
