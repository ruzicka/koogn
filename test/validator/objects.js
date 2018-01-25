'use strict'

const {testBoth, testMerging, testNonMerging} = require('../helpers')

describe('Objects', () => {

  describe('Simple objects', () => {

    it('should validate object by object with the same structure', () => {
      testBoth({}, {}, true)
      testBoth({a: 1}, {a: 10}, true)
      testBoth({
        id: 11,
        name: 'john',
        friend: {
          first_name: 'Joe',
          last_name: 'Doe',
        },
      }, {
        id: 5465,
        name: 'david',
        friend: {
          first_name: 'Jack',
          last_name: 'Black',
        },
      }, true)
    })

    it('should validate object with any structure by an empty object', () => {
      testBoth({}, {}, true)
      testBoth({a: 1}, {}, true)
      testBoth({xx: 'hello', a: {b: ['a', 1, 2]}}, {}, true)
    })

    it('should NOT validate object by object with different structure', () => {
      testBoth({}, {b: 10}, false)
      testBoth({a: 1}, {b: 10}, false)
    })

    it('should validate objects with nested array of compatible objects', () => {
      const instance = {
        id: 12,
        a: [
          {test: 1},
          {test: 2},
        ],
      }
      const example = {
        id: 484,
        a: [
          {test: 283},
          {test: 459},
        ],
      }

      testBoth(instance, example, true)
    })

    it('should NOT validate objects with nested array of compatible objects', () => {
      const instance = {
        id: 12,
        a: [
          {test: 1},
          {test: 'xxx'},  // incompatible
        ],
      }
      const example = {
        id: 484,
        a: [
          {test: 283},
          {test: 483},
        ],
      }

      testBoth(instance, example, false)
    })

    it('should validate objects with nested array of incompatible objects', () => {
      const instance = {
        id: 12,
        a: [
          {test: 1},
          {test: 2},
        ],
      }
      const example = {
        id: 484,
        a: [
          {test: 283},
          {differentKeyName: 459},
        ],
      }

      const example2 = {
        id: 484,
        a: [
          {test: 283},
          {test: 'xxx'},
        ],
      }

      const example3 = {
        id: 484,
        a: [
          {test: 283},
          {yyyy: 'xxx'},
        ],
      }

      testBoth(instance, example, true)
      testBoth(instance, example2, true)
      testBoth(instance, example3, true)
    })

    it('should NOT validate objects with nested array of incompatible objects (merging)', () => {
      const instance = {
        id: 12,
        a: [
          'hello', // incompatible
          {test: 2},
        ],
      }
      const example = {
        id: 484,
        a: [
          {test: 283},
          {differentKeyName: 459},
        ],
      }

      testMerging(instance, example, false)
    })

    it('should not-validate/validate objects with nested array of incompatible objects', () => {
      const instance = {
        id: 12,
        a: [
          {test: 2},
          {test: 44},
        ],
      }
      const instance2 = {
        id: 12,
        a: [
          {test: 2},
          {test: 44},
          {hello: 'test'},
        ],
      }
      const example = {
        id: 484,
        a: [
          {test: 283},
          {differentKeyName: 459},
        ],
      }
      testNonMerging(instance, example, true)
      testNonMerging(instance2, example, false)
      testMerging(instance2, example, true)
    })

    it('should not-validate/validate objects with nested array of mixed types', () => {
      const instance = {
        id: 12,
        a: [
          {test: 2},
          {test: 44},
        ],
      }
      const instance2 = {
        id: 12,
        a: [
          {test: 2},
          {test: 44},
          {hello: 'test'},
        ],
      }
      const instance3 = {
        id: 12,
        a: [
          {test: 2},
          {test: 44},
          'hi',
        ],
      }
      const instance4 = {
        id: 12,
        a: [
          'cao',
          'hi',
        ],
      }
      const example = {
        id: 484,
        a: [
          'hello',
          {differentKeyName: 459},
        ],
      }
      testMerging(instance, example, true)
      testMerging(instance2, example, true)
      testMerging(instance3, example, true)
      testNonMerging(instance, example, false)
      testNonMerging(instance2, example, false)
      testNonMerging(instance3, example, false)
      testNonMerging(instance4, example, true)
    })
  })

  describe('just $schema object', () => {
    const example = {$schema: {type: 'array', items: {type: 'string'}}}

    it('should validate', () => {
      testBoth(['hello', 'hi'], example, true)
      testBoth([], example, true)
    })
    it('should not validate instance3', () => {
      testBoth(['cau', 1], example, false)
      testBoth('sdfs', example, false)
      testBoth(111, example, false)
    })
  })

  describe('simple objects with $schema key', () => {
    const example = {
      id: 1,
      name: 'john',
      labels: {$schema: {type: 'array', items: {type: 'string'}}},
    }

    it('should validate instance1', () => {
      const instance = {
        id: 3,
        name: 'James',
        labels: ['hello', 'hi'],
      }
      testBoth(instance, example, true)
    })

    it('should validate instance2', () => {
      const instance = {
        id: 3,
        name: 'James',
        labels: [],
      }
      testBoth(instance, example, true)
    })

    it('should not validate instance3', () => {
      const instance = {
        id: 3,
        name: 'James',
        labels: ['cau', 1],
      }
      testBoth(instance, example, false)
    })

    it('should not validate instance4', () => {
      const instance = {
        id: 3,
        name: 'James',
      }
      testBoth(instance, example, false)
    })
  })

  describe('several nested $schema objects', () => {
    const example = {
      id: 1,
      author: {
        firstName: 'John',
        lastName: 'Smith',
        phones: {$schema: {type: 'array', items: {type: 'string'}}},
      },
      labels: {$schema: {type: 'array', items: {type: 'string'}}},
    }
    it('should validate', () => {
      const instance = {
        id: 3,
        author: {
          firstName: 'James',
          lastName: 'Dean',
          phones: ['1233425'],
        },
        labels: ['hello', 'hi'],
      }
      testBoth(instance, example, true)
    })
    it('should not validate instance3', () => {
      const instance = {
        id: 3,
        author: {
          firstName: 'James',
          lastName: 'Dean',
          phones: ['1233425', {}],
        },
        labels: ['hello', 'hi'],
      }
      testBoth(instance, example, false)
    })
  })
})
