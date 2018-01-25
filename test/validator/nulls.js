'use strict'

const {testBoth} = require('../helpers')

describe('Nulls', () => {

  it('should validate null by null', () => {
    testBoth(null, null, true)
  })

  it('should NOT validate null by other types', () => {
    testBoth(null, 1, false)
    testBoth(null, '', false)
    testBoth(null, 'x', false)
    testBoth(null, [], false)
    testBoth(null, ['a'], false)
    testBoth(null, {}, false)
    testBoth(null, {a: 1}, false)
    testBoth(null, true, false)
    testBoth(null, new Date(), false)
  })
})
