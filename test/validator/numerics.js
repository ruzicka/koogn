'use strict'

const {testBoth} = require('../helpers')

describe('Numeric types', () => {

  describe('integer', () => {

    it('should validate integer by integer', () => {
      testBoth(5, 1, true)
      testBoth(-5, 1, true)
      testBoth(0, 1, true)
      testBoth(1, -5, true)
      testBoth(1, 0, true)
      testBoth(1, 5, true)
    })

    it('should NOT validate float by integer', () => {
      testBoth(5.1, 1, false)
      testBoth(5.1, -1, false)
      testBoth(5.1, 0, false)
    })

    it('should NOT validate integer by other types', () => {
      testBoth(5, new Date(), false)
      testBoth(5, '', false)
      testBoth(5, 'x', false)
      testBoth(5, [], false)
      testBoth(5, ['a'], false)
      testBoth(5, {}, false)
      testBoth(5, {a: 1}, false)
      testBoth(5, true, false)
      testBoth(5, null, false)
    })
  })

  describe('number', () => {

    it('should validate float by float', () => {
      testBoth(5.1, 1.3, true)
      testBoth(-5.1, 1.3, true)
      testBoth(5.1, -1.3, true)
      testBoth(-5.1, -1.3, true)
      testBoth(0, -1.3, true)
    })

    it('should validate integer by float', () => {
      testBoth(5, 1.3, true)
      testBoth(-5, 1.3, true)
      testBoth(5, -1.3, true)
      testBoth(-5, -1.3, true)
      testBoth(0, -1.3, true)
    })

    it('should NOT validate float by other types', () => {
      testBoth(5.2, new Date(), false)
      testBoth(5.2, '', false)
      testBoth(5.2, 'x', false)
      testBoth(5.2, [], false)
      testBoth(5.2, ['a'], false)
      testBoth(5.2, {}, false)
      testBoth(5.2, {a: 1}, false)
      testBoth(5.2, true, false)
      testBoth(5.2, null, false)
    })
  })
})
