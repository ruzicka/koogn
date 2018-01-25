'use strict'

const {testBoth} = require('../helpers')

describe('Dates', () => {

  const someDate = new Date('2000-10-10')

  it('should validate any Date by another Date', () => {
    testBoth(new Date(), someDate, true)
  })

  it('should NOT validate Date by other types', () => {
    testBoth(someDate, 1, false)
    testBoth(someDate, '', false)
    testBoth(someDate, 'x', false)
    testBoth(someDate, [], false)
    testBoth(someDate, ['a'], false)
    testBoth(someDate, {}, false)
    testBoth(someDate, {a: 1}, false)
    testBoth(someDate, true, false)
    testBoth(true, null, false)
  })

  it('should NOT validate date string by Date', () => {
    testBoth('2012-07-08T16:41:41.532+00:00', someDate, false)
  })
})
