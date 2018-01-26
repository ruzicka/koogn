'use strict'

const {testSNone, testSName, testSContent, testSBoth} = require('../helpers')


// TODO regulars

const stringFormats = {
  'date-time': {
    reverse: true,
    valid: [
      '2012-07-08T16:41:41.532Z',
      '2012-07-08T16:41:41Z',
      '2012-07-08T16:41:41.532+00:00',
      '2012-07-08T16:41:41.532+05:30',
      '2012-07-08T16:41:41.532+04:00',
      '2012-07-08T16:41:41.532z',
      '2012-07-08 16:41:41.532Z',
      '2012-07-08t16:41:41.532Z',
    ],
    invalid: [
      '2012-07-08',
      'TEST2012-07-08T16:41:41.532Z',
      '2012-07-08T16:41:41.532+00:00Z',
      '2012-07-08T16:41:41.532+Z00:00',
    ],
  },
  date: {
    reverse: true,
    valid: '2012-07-08',
    invalid: 'TEST2012-07-08',
  },
  time: {
    reverse: true,
    valid: '16:41:41',
    invalid: '16:41:41.532Z',
  },
  'utc-millisec': {
    reverse: true,
    valid: '-1234567890',
    invalid: '16:41:41.532Z',
  },
  regex: {
    valid: '/a/',
    invalid: '/^(abc]/',
  },
  color: {
    reverse: true,
    valid: [
      'red',
      '#f00',
      '#ff0000',
      'rgb(255,0,0)',
    ],
    invalid: 'json',
  },
  style: {
    reverse: true,
    valid: [
      'color: red;',
      'color: red; position: absolute; background-color: rgb(204, 204, 204); max-width: 150px;',
      'color:red;position:absolute; background-color:     rgb(204, 204, 204); max-width: 150px;',
    ],
    invalid: '0',
  },
  phone: {
    reverse: true,
    valid: '+31 42 123 4567',
    invalid: '31 42 123 4567',
  },
  uri: {
    reverse: true,
    valid: [
      'http://www.google.com/',
      'http://www.google.com/search',
    ],
    invalid: [
      'tdegrunt',
      'The dog jumped',
    ],
  },
  email: {
    reverse: true,
    valid: [
      'obama@whitehouse.gov',
      'barack+obama@whitehouse.gov',
    ],
    invalid: 'obama@',
  },
  'ip-address': {
    reverse: true,
    valid: [
      '192.168.0.1',
      '127.0.0.1',
    ],
    invalid: [
      '192.168.0',
      '256.168.0',
    ],
  },
  ipv6: {
    reverse: true,
    valid: [
      'fe80::1%lo0',
      '::1',
    ],
    invalid: [
      '127.0.0.1',
      'localhost',
    ],
  },
  'host-name': {
    valid: [
      'localhost',
      'www.google.com',
    ],
    invalid: 'www.-hi-.com',
  },
  alpha: {
    valid: [
      'alpha',
      'abracadabra',
    ],
    invalid: 'www.-hi-.com',
  },
  alphanumeric: {
    valid: [
      'alpha',
      '123',
      'abracadabra123',
    ],
    invalid: '1test!',
  },
}
stringFormats.hostname = stringFormats['host-name']
stringFormats.regexp = stringFormats.regex
stringFormats.pattern = stringFormats.regex
stringFormats.ipv4 = {
  ...stringFormats['ip-address'],
  reverse: false,
}

function contentOptionStringFormatTest(testFunction, option) {
  Object.keys(stringFormats).filter(key => stringFormats[key].reverse).forEach((formatName) => {
    if (formatName === 'style') {
      return // TODO temporarily disables styles tests, due to bug in jsonschema (https://github.com/tdegrunt/jsonschema/pull/243)
    }

    const format = stringFormats[formatName]

    describe(`${formatName} (${option})`, () => {

      const valid = Array.isArray(format.valid) ? format.valid : [format.valid]
      const invalid = Array.isArray(format.invalid) ? format.invalid : [format.invalid]
      valid.forEach((example) => {
        it(`should validate ${example} (${option})`, () => {
          valid.forEach((instance) => {
            testFunction(instance, example, true)
          })
        })
      })
      valid.forEach((example) => {
        it(`should not validate ${example} (${option})`, () => {
          invalid.forEach((instance) => {
            testFunction(instance, example, false)
          })
        })
      })
    })
  })
}

function noneOptionStringFormatTest() {
  Object.keys(stringFormats).forEach((formatName) => {

    const format = stringFormats[formatName]

    describe(formatName, () => {

      const valid = Array.isArray(format.valid) ? format.valid : [format.valid]
      const invalid = Array.isArray(format.invalid) ? format.invalid : [format.invalid]

      valid.forEach((example) => {
        it(`should validate ${example}`, () => {
          valid.forEach((instance) => {
            testSNone(instance, example, true)
          })
          invalid.forEach((instance) => {
            testSNone(instance, example, true)
          })
        })
      })
    })
  })
}

function nameOptionStringFormatTest(testFunction, option) {
  Object.keys(stringFormats).forEach((formatName) => {
    if (formatName === 'regexp' || formatName === 'pattern') {
      return // TODO temporarily disables styles tests, due to bug in jsonschema (https://github.com/tdegrunt/jsonschema/pull/243)
    }

    const format = stringFormats[formatName]

    describe(`${formatName} (${option})`, () => {

      const valid = Array.isArray(format.valid) ? format.valid : [format.valid]
      const invalid = Array.isArray(format.invalid) ? format.invalid : [format.invalid]

      it(`should validate ${formatName} (${option})`, () => {
        valid.forEach((instance) => {
          testFunction(instance, formatName, true)
        })
      })
      it(`should not validate ${formatName} (${option})`, () => {
        invalid.forEach((instance) => {
          testFunction(instance, formatName, false)
        })
      })
    })
  })
}

function bothOptionStringFormatTest() {
  contentOptionStringFormatTest(testSContent, 'content')
  nameOptionStringFormatTest(testSName, 'name')
}


describe('Strings', () => {

  describe('Normal string', () => {

    it('should validate string by string', () => {
      testSBoth('some', 'string', true)
      testSBoth('', 'string', true)
      testSBoth('some', '', true)
    })

    it('should NOT validate string by other types', () => {
      testSBoth('string', null, false)
      testSBoth('string', 1, false)
      testSBoth('string', [], false)
      testSBoth('string', ['a'], false)
      testSBoth('string', {}, false)
      testSBoth('string', {a: 1}, false)
      testSBoth('string', true, false)
      testSBoth('string', new Date(), false)
    })
  })

  describe('String format reverse discovery', () => {
    contentOptionStringFormatTest(testSContent)
  })

  describe('Strings format option "none"', () => {
    noneOptionStringFormatTest()
  })

  describe('Strings format option "name"', () => {
    nameOptionStringFormatTest(testSName)
  })

  describe('Strings format option "name"', () => {
    bothOptionStringFormatTest()
  })
})
