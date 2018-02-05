'use strict'

const {expect} = require('chai')
const {testBoth, testMerging, testNonMerging, standardValidator} = require('../helpers')
const {InvalidExampleError} = require('../../src/errors')

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
          {test: 'xxx'}, // incompatible
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
      labels: {$schema: {type: 'array', items: {type: 'string'}, required: true}},
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
    it('should not validate instance', () => {
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

  describe('$schema with required property', () => {
    const example = {
      id: 1,
      label: {$schema: {type: 'string', required: false}},
    }
    it('should validate', () => {
      const instance = {
        id: 3,
        label: 'hello',
      }
      const instance2 = {
        id: 3,
      }
      testBoth(instance, example, true)
      testBoth(instance2, example, true)
    })
  })

  describe('objects with $required/$optional', () => {

    describe('$required', () => {
      describe('simple object with $required', () => {
        const example = {
          id: 3,
          author: 'john',
          labels: ['hello', 'hi'],
          $required: ['id', 'author'],
        }

        it('should validate object with all required fields present', () => {
          const instance = {
            id: 5,
            author: 'Jane Doe',
            labels: ['nothing'],
          }
          testBoth(instance, example, true)
        })

        it('should validate object with missing optional property', () => {
          const instance = {
            id: 5,
            author: 'Jane Doe',
          }
          testBoth(instance, example, true)
        })

        it('should not validate object with missing required property', () => {
          const instance = {
            id: 5,
            labels: ['nothing'],
          }
          testBoth(instance, example, false)
        })

        it('should not validate object with extra property', () => {
          const instance = {
            id: 5,
            author: 'Jane Doe',
            labels: ['nothing'],
            somethingNew: 'test',
          }
          testBoth(instance, example, false)
        })

        it('should validate object with single required field passed as string', () => {
          const example2 = {
            id: 3,
            author: 'john',
            labels: ['hello', 'hi'],
            $required: 'id',
          }
          const instance1 = {
            id: 5,
            author: 'Jane Doe',
            labels: ['nothing'],
          }
          const instance2 = {
            id: 5,
          }
          testBoth(instance1, example2, true)
          testBoth(instance2, example2, true)
        })
      })

      describe('array containing objects with $required', () => {

        it('simple array with object containing $require', () => {
          const example = [{
            a: 11,
            b: 'str',
            c: true,
            $required: ['a', 'c'],
          }]
          const instance1 = [{
            a: 3,
            b: 'xxx',
            c: false,
          }]
          const instance2 = [{
            a: 3,
            c: false,
          }]
          const instance3 = [{
            a: 3,
            b: 'xxx',
          }]
          testBoth(instance1, example, true)
          testBoth(instance2, example, true)
          testBoth(instance3, example, false)
        })

        it('object containing array of objects with $required', () => {
          const example = {
            a: [{
              x: 'str',
              y: true,
              $required: ['y'],
            }],
            b: 11,
          }
          const instance1 = {
            a: [{
              y: false,
            }],
            b: 33,
          }
          const instance2 = {
            a: [{
              x: 'hello',
            }],
            b: 33,
          }
          const instance3 = {
            a: [{
              y: false,
            }, {
              x: 'hello',
            }],
            b: 33,
          }
          testBoth(instance1, example, true)
          testBoth(instance2, example, false)
          testBoth(instance3, example, false)
        })

      })

      describe('validate internal json schema for objects with $required', () => {
        it('non-existing property on object with different property', () => {
          const example = {
            b: 1,
            $required: ['a'],
          }
          expect(() => standardValidator.getSchema(example))
            .to.throw(InvalidExampleError)
        })

        it('non-existing property on object witout properties', () => {
          const example = {
            b: 1,
            $required: ['a'],
          }
          expect(() => standardValidator.getSchema(example))
            .to.throw(InvalidExampleError)
        })

        it('empty $required', () => {
          const example = {
            b: 1,
            $required: [],
          }
          const expectedSchema = {
            type: 'object',
            properties: {
              b: {
                type: 'integer',
                required: false,
              },
            },
            required: true,
            additionalProperties: false,
          }
          expect(standardValidator.getSchema(example))
            .to.eql(expectedSchema)
        })

        it('wrong type $required', () => {
          const example = {
            b: 1,
            $required: true,
          }
          expect(() => standardValidator.getSchema(example))
            .to.throw(InvalidExampleError)
        })
      })
    })


    describe('$optional', () => {
      describe('simple object with $optional', () => {
        const example = {
          id: 3,
          author: 'john',
          labels: ['hello', 'hi'],
          title: 'some title',
          $optional: ['labels', 'author'],
        }

        it('should validate object with all required fields present', () => {
          const instance = {
            id: 5,
            title: 'Arty title',
            author: 'Jane Doe',
            labels: ['nothing'],
          }
          testBoth(instance, example, true)
        })

        it('should validate object with missing optional property', () => {
          const instance = {
            id: 5,
            title: 'Arty title',
          }
          testBoth(instance, example, true)
        })

        it('should not validate object with missing required property', () => {
          const instance = {
            id: 5,
          }
          testBoth(instance, example, false)
        })

        it('should not validate object with extra property', () => {
          const instance = {
            id: 5,
            author: 'Jane Doe',
            title: 'Arty title',
            labels: ['nothing'],
            somethingNew: 'test',
          }
          testBoth(instance, example, false)
        })

        it('should validate object all single optional field passed as string', () => {
          const example2 = {
            id: 3,
            author: 'john',
            labels: ['hello', 'hi'],
            $optional: 'labels',
          }
          const instance1 = {
            id: 5,
            author: 'Jane Doe',
            labels: ['nothing'],
          }
          const instance2 = {
            id: 5,
            author: 'Jane Doe',
          }
          const instance3 = {
            id: 5,
          }
          testBoth(instance1, example2, true)
          testBoth(instance2, example2, true)
          testBoth(instance3, example2, false)
        })
      })

      describe('array containing objects with $optional', () => {

        it('simple array with object containing $optional', () => {
          const example = [{
            a: 11,
            b: 'str',
            c: true,
            $optional: ['a', 'c'],
          }]
          const instance1 = [{
            a: 3,
            b: 'xxx',
            c: false,
          }]
          const instance2 = [{
            a: 3,
            c: false,
          }]
          const instance3 = [{
            a: 3,
            b: 'xxx',
          }]
          const instance4 = [{
            b: 'xxx',
          }]
          testBoth(instance1, example, true)
          testBoth(instance2, example, false)
          testBoth(instance3, example, true)
          testBoth(instance4, example, true)
        })

        it('object containing array of objects with $optional', () => {
          const example = {
            a: [{
              x: 'str',
              y: true,
              $optional: 'y',
            }],
            b: 11,
          }
          const instance1 = {
            a: [{
              x: 'xxx',
            }],
            b: 33,
          }
          const instance2 = {
            a: [{
              y: false,
            }],
            b: 33,
          }
          const instance3 = {
            a: [{
              y: false,
            }, {
              x: 'hello',
            }],
            b: 33,
          }
          testBoth(instance1, example, true)
          testBoth(instance2, example, false)
          testBoth(instance3, example, false)
        })

      })

      describe('validate internal json schema for objects with $optional', () => {
        it('non-existing property on object with different property', () => {
          const example = {
            b: 1,
            $optional: ['a'],
          }
          expect(() => standardValidator.getSchema(example))
            .to.throw(InvalidExampleError)
        })

        it('non-existing property on object without any property', () => {
          const example = {
            $optional: ['a'],
          }
          expect(() => standardValidator.getSchema(example))
            .to.throw(InvalidExampleError)
        })

        it('empty $optional', () => {
          const example = {
            b: 1,
            $optional: [],
          }
          const expectedSchema = {
            type: 'object',
            properties: {
              b: {
                type: 'integer',
                required: true,
              },
            },
            required: true,
            additionalProperties: false,
          }
          expect(standardValidator.getSchema(example))
            .to.eql(expectedSchema)
        })

        it('wrong type', () => {
          const example = {
            b: 1,
            $optional: true,
          }
          expect(() => standardValidator.getSchema(example))
            .to.throw(InvalidExampleError)
        })
      })
    })
  })
})
