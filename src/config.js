'use strict'

const preProcessObjectFnc = (obj, defaultFnc) => obj.$schema || defaultFnc(obj)
const postProcessCommonFnc = (type, schema, value, defaultFunc) => { // prevents override of required field in $schemas
  if (type === 'object' && value.$schema) {
    return schema // disabling default post processing (which is setting the require param)
  }
  return defaultFunc(type, schema, value)
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
    required: true,
    postProcessFnc: postProcessCommonFnc, // prevents override of required field in $schemas
    arrays: {
      mode: validatorOptions.arrays.mode,
    },
    strings: {
      detectFormat: stringsDetectFormat,
    },
    objects: {
      preProcessFnc: preProcessObjectFnc, // makes $schema work
      additionalProperties: validatorOptions.objects.additionalProperties,
    },
  }

  if (formatDetectionMode === 'both' || formatDetectionMode === 'name') {
    toJsonSchemaOptions.strings.preProcessFnc = stringsCustomFunction // takes care of string format auto-detection
  }

  return toJsonSchemaOptions
}

module.exports = {
  getValidatorOptions,
  convertToToJsonSchemaOptions,
}
