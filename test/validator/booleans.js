'use strict'

const {testBoth} = require('../helpers')


describe('Booleans', () => {

  it('should validate any boolean by any boolean', () => {
    testBoth(true, true, true)
    testBoth(false, true, true)
    testBoth(true, false, true)
    testBoth(false, false, true)
  })

  it('should not validate boolean by other types', () => {
    testBoth(true, 1, false)
    testBoth(true, '', false)
    testBoth(true, 'x', false)
    testBoth(true, [], false)
    testBoth(true, ['a'], false)
    testBoth(true, {}, false)
    testBoth(true, {a: 1}, false)
    testBoth(true, new Date(), false)
    testBoth(true, null, false)
  })
})
