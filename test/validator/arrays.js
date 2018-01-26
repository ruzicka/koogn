'use strict'

const {testBoth, testMerging, testNonMerging} = require('../helpers')

describe('Array', () => {

  describe('Simple types', () => {

    it('should validate any array by an empty array', () => {
      testBoth([], [], true)
      testBoth([1, 2, 4], [], true)
      testBoth([1.1, 2, 4], [], true)
      testBoth(['a', 'b', 'c'], [], true)
    })

    it('should not validate by array of ints', () => {
      const testCases = [
        [1, 2.1, 4],
        [1.2, 2.1, 4.3],
        ['a', 'b'],
        [1.2, 2.1, 4.3],
        [1.1],
      ]
      testCases.forEach(val => testBoth(val, [5, 7, 0], false))
    })

    it('should validate by array of ints', () => {
      const testCases = [
        [1, 1, 4],
        [1],
        [0],
        [],
      ]
      testCases.forEach(val => testBoth(val, [5, 7, 0], true))
    })

    it('should validate by array of mixed ints and floats (merging)', () => {
      const testCases = [
        [1, 1, 4],
        [1],
        [0],
        [],
        [2.1],
        [2.1, 3.1],
        [1, 1.7],
      ]
      testCases.forEach(val => testMerging(val, [5, 7.1, 0], true))
    })

    it('should not validate by array of mixed ints and floats (non-merging)', () => {
      const testCases = [
        [2.1],
        [2.1, 3.1],
        [1, 1.7],
      ]
      testCases.forEach(val => testNonMerging(val, [5, 7.1, 0], false))
    })

    it('should validate by array of mixed ints and floats (non-merging)', () => {
      const testCases = [
        [1, 1, 4],
        [1],
        [0],
        [],
      ]
      testCases.forEach(val => testNonMerging(val, [5, 7.1, 0], true))
    })

    it('should validate by array of strings', () => {
      const testCases = [
        ['a', 'something'],
        ['v'],
        [],
      ]
      testCases.forEach(val => testBoth(val, ['a', 'b'], true))
    })

    it('should NOT validate by array of strings', () => {
      const testCases = [
        ['a', 'something', 1],
        [1],
        [1.3],
        [['a', 'b']],
      ]
      testCases.forEach(val => testBoth(val, ['a', 'b'], false))
    })

    it('should validate by array of mixed types (not just numeric ones) (merging)', () => {
      const testCases = [
        ['a', 'something', 1],
        ['x', 'y', 'z'],
        [1],
        [1.3],
        [['a', 'b']],
        [],
      ]
      testCases.forEach(val => testMerging(val, ['a', 'b', 1], true))
    })

    it('should not validate by array of mixed types (not just numeric ones) (non-merging)', () => {
      const testCases = [
        ['a', 'something', 1],
        [1],
        [1.3],
        [['a', 'b']],
      ]
      testCases.forEach(val => testNonMerging(val, ['a', 'b', 1], false))
    })
  })

  describe('Arrays and objects', () => {

    it('should validate by array of 1 object', () => {
      const testCases = [
        [],
        [{id: 11, title: 'test'}],
        [{id: 22, title: 'new'}],
        [{id: 11, title: 'test'}, {id: 22, title: 'new'}],
      ]
      testCases.forEach(val => testBoth(val, [{id: 11, title: 'test'}], true))
    })

    it('should validate by array of the same objects', () => {
      const testCases = [
        [],
        [{id: 11, title: 'test'}],
        [{id: 22, title: 'new'}],
        [{id: 11, title: 'test'}, {id: 22, title: 'new'}],
      ]
      testCases.forEach(val => testBoth(val, [{id: 11, title: 'test'}, {id: 33, title: 'old'}], true))
    })

    it('should not validate by array of the same objects', () => {
      const testCases = [
        [1],
        ['a'],
        [{id: 44, name: 'john'}],
        [{id: 11, title: 'test'}, {id: 44, name: 'john'}],
        [{}],
      ]
      testCases.forEach(val => testBoth(val, [{id: 11, title: 'test'}, {id: 33, title: 'old'}], false))
    })

    it('should validate by array of incompatible objects (merging)', () => {
      const testCases = [
        [],
        [{}],
        [{id: 11, title: 'test'}],
        [{id: 22, title: 'new'}],
        [{id: 11, title: 'test'}, {id: 22, title: 'new'}],
        [{id: 11, title: 'test'}, {id: 22, name: 'david'}],
        [{very: 'different'}, {objects: 'indeed'}, {}],
      ]
      testCases.forEach(val => testMerging(val, [{id: 11, title: 'test'}, {id: 33, name: 'john'}], true))
    })

    it('should validate by array of incompatible objects (non-merging)', () => {
      const testCases = [
        [],
        [{id: 11, title: 'test'}],
        [{id: 22, title: 'new'}],
        [{id: 11, title: 'test'}, {id: 22, title: 'new'}],
      ]
      testCases.forEach(val => testMerging(val, [{id: 11, title: 'test'}, {id: 33, name: 'john'}], true))
    })

    it('should NOT validate by array of incompatible objects (merging)', () => {
      const testCases = [
        [1],
        ['a'],
        [1, 'a'],
        [[{id: 22, title: 'new'}]],
        [{id: 11, title: 'test'}, 1],
        [{very: 'different'}, {objects: 'indeed'}, 1],
      ]
      testCases.forEach(val => testNonMerging(val, [{id: 11, title: 'test'}, {id: 33, name: 'john'}], false))
    })

    it('should NOT validate by array of incompatible objects (non-merging)', () => {
      const testCases = [
        [{}],
        [1],
        ['a'],
        [1, 'a'],
        [{id: 22, name: 'david'}],
        [{id: 11, title: 'test'}, {id: 22, name: 'david'}],
        [{very: 'different'}, {objects: 'indeed'}, {}],
        [[{id: 22, title: 'new'}]],
        [{id: 11, title: 'test'}, 1],
        [{very: 'different'}, {objects: 'indeed'}, 1],
      ]
      testCases.forEach(val => testNonMerging(val, [{id: 11, title: 'test'}, {id: 33, name: 'john'}], false))
    })


    it('should validate by array of arrays of mixed numbers/ints (merging)', () => {
      const testCases = [
        [],
        [[]],
        [[], []],
        [[4, 5, 6]],
        [[4, 5, 6], [7, 8]],
        [[4.1, 5.5, 6]],
        [[4.1, 5.5, 6], [6.4, 5.7]],
        [[4.1, 5.5, 6.1]],
      ]
      testCases.forEach(val => testMerging(val, [[1, 2, 3], [1.1, 2.2, 3]], true))
    })
    it('should NOT validate by array of arrays of mixed numbers/ints (merging)', () => {
      const testCases = [
        [{}],
        [1],
        ['a'],
        [['a']],
        [['a', 8], [5, 9]],
      ]
      testCases.forEach(val => testMerging(val, [[1, 2, 3], [1.1, 2.2, 3]], false))
    })
    it('should validate by array of arrays of mixed numbers/ints (non-merging)', () => {
      const testCases = [
        [],
        [[]],
        [[], []],
        [[4, 5, 6]],
        [[4, 5, 6], [7, 8]],
      ]
      testCases.forEach(val => testNonMerging(val, [[1, 2, 3], [1.1, 2.2, 3]], true))
    })
    it('should NOT validate by array of arrays of mixed numbers/ints (non-merging)', () => {
      const testCases = [
        [{}],
        [1],
        ['a'],
        ['a', 'b'],
        [['a']],
        [['a'], ['b']],
        [['a', 8], [5, 9]],
        [[1.2]],
      ]
      testCases.forEach(val => testNonMerging(val, [[1, 2, 3], [1.1, 2.2, 3]], false))
    })


    const arrOfComplexObjs = [
      {id: 11, a: [1, 2, 3]},
      {id: 12, a: [1.1, 2.2, 3]},
    ]
    it('should validate by array of complex objects containing arrays of mixed ints/nums (merging)', () => {
      const testCases = [
        [],
        [{id: 1, a: [1, 2]}],
        [{id: 2, a: [1.1, 2.2]}],
        [{id: 1, a: [1, 2]}, {id: 2, a: [1.1, 2.2]}, {id: 3, a: [1, 2.3]}],
        [{id: 11, a: [1, 2, 3]}, {id: 12, a: [1.1, 2.2, 3]}],
        arrOfComplexObjs,
      ]
      testCases.forEach(val => testMerging(val, arrOfComplexObjs, true))
    })
    it('should NOT validate by array of complex objects containing arrays of mixed ints/nums (merging)', () => {
      const testCases = [
        [{}],
        [{id: 1}],
        [{a: [1, 2]}],
        [{b: 1}],
        [{id: 'a', a: [1.1, 2.2]}],
        [{id: 2, a: [1.1, 2.2, 'c']}],
        [{id: 2, a: [1.1, 2.2]}, {id: 2, a: [1.1, 2.2, 'c']}],
        [{id: 1, a: [1, 2]}, {id: 2, a: [1.1, 2.2]}, {id: 3, a: [1, 2.3, 'x']}],
      ]
      testCases.forEach(val => testMerging(val, arrOfComplexObjs, false))
    })
    it('should validate by array of complex objects containing arrays of mixed ints/nums (non-merging)', () => {
      const testCases = [
        [],
        [{id: 1, a: [1, 2]}],
        [{id: 2, a: [4, 3]}],
      ]
      testCases.forEach(val => testNonMerging(val, arrOfComplexObjs, true))
    })
    it('should NOT validate by array of complex objects containing arrays of mixed ints/nums (non-merging)', () => {
      const testCases = [
        [{}],
        [{id: 1}],
        [{a: [1, 2]}],
        [{b: 1}],
        [{id: 'a', a: [1.1, 2.2]}],
        [{id: 2, a: [1.1, 2.2, 'c']}],
        [{id: 2, a: [1.1, 2.2]}, {id: 2, a: [1.1, 2.2, 'c']}],
        [{id: 1, a: [1, 2]}, {id: 2, a: [1.1, 2.2]}, {id: 3, a: [1, 2.3, 'x']}],
        [{id: 2, a: [1.1, 2.2]}],
        [{id: 1, a: [1, 2]}, {id: 2, a: [1.1, 2.2]}, {id: 3, a: [1, 2.3]}],
        [{id: 11, a: [1, 2, 3]}, {id: 12, a: [1.1, 2.2, 3]}],
        arrOfComplexObjs,
      ]
      testCases.forEach(val => testNonMerging(val, arrOfComplexObjs, false))
    })


    const arrOfComplexObjsWithIncompatibilities = [
      {id: 11, a: [1, 2, 3, {test: 23}]},
      {id: 12, a: [1.1, 2.2, 3]},
    ]
    it('should validate by array of objects containing arrays of mixed ints/nums (merging)', () => {
      const testCases = [
        [],
        [{id: 1, a: []}],
        [{id: 1, a: ['a']}],
        [{id: 1, a: [{}]}],
        [{id: 1, a: [{a: 1}]}],
        [{id: 1, a: [1, 2]}],
        [{id: 2, a: [1.1, 2.2]}],
        [{id: 1, a: [1, 2]}, {id: 2, a: [1.1, 2.2]}, {id: 3, a: [1, 2.3]}],
        [{id: 11, a: [1, 2, 3]}, {id: 12, a: [1.1, 2.2, 3]}],
        [{id: 11, a: [1, 2, 3]}, {id: 12, a: [1.1, 2.2, 'a']}],
        arrOfComplexObjsWithIncompatibilities,
      ]
      testCases.forEach(val => testMerging(val, arrOfComplexObjsWithIncompatibilities, true))
    })
    it('should NOT validate by array of objects containing arrays of mixed ints/nums (merging)', () => {
      const testCases = [
        [{}],
        [{id: 1}],
        [{a: [1, 2]}],
        [{b: 1}],
        [{id: 'a', a: [1.1, 2.2]}],
      ]
      testCases.forEach(val => testMerging(val, arrOfComplexObjsWithIncompatibilities, false))
    })
    it('should validate by array of objects containing arrays of mixed ints/nums (non-merging)', () => {
      const testCases = [
        [],
        [{id: 1, a: []}],
        [{id: 1, a: [1, 2]}],
      ]
      testCases.forEach(val => testNonMerging(val, arrOfComplexObjsWithIncompatibilities, true))
    })

    it('should NOT validate by array of objects containing arrays of mixed ints/nums (non-merging)', () => {
      const testCases = [
        [{id: 1, a: ['a']}],
        [{id: 1, a: [{}]}],
        [{id: 1, a: [{a: 1}]}],
        [{id: 2, a: [1.1, 2.2]}],
        [{id: 1, a: [1, 2]}, {id: 2, a: [1.1, 2.2]}, {id: 3, a: [1, 2.3]}],
        [{id: 11, a: [1, 2, 3]}, {id: 12, a: [1.1, 2.2, 3]}],
        [{id: 11, a: [1, 2, 3]}, {id: 12, a: [1.1, 2.2, 'a']}],
        arrOfComplexObjsWithIncompatibilities,
      ]
      testCases.forEach(val => testNonMerging(val, arrOfComplexObjsWithIncompatibilities, false))
    })


    const complexObj = [
      {
        id: 11,
        a: [
          {
            b: [1, 2, 3],
            c: [1, 2, 3],
            d: [1, 2, 3],
            e: [1, 2, 3],
          },
          {
            b: [1, 2, 3],
            c: [1, 2.2, 3],
            d: [1, 2, 3],
            e: [1, 2, {x: 11}],
          },
        ],
      },
      {
        id: 12,
        a: [
          {
            b: [1, 2, 3],
            c: [1, 2, 3],
            d: [1, 2.2, 3],
            e: [1, 2, 3],
          },
          {
            b: [1, 2, 3],
            c: [1, 2.2, 3],
            d: [1, 2, 3],
            e: [1, 2, 3],
          },
        ],
      },
    ]
    it('should validate by deeply nested obj (merging)', () => {
      const testCases = [
        [],
        [
          {
            id: 11,
            a: [
              {
                b: [1, 2, 3],
                c: [1.5, 2, 3],
                d: [1, 2, 3],
                e: ['aa', 'bb'],
              },
            ],
          },
        ],
        complexObj,
      ]
      testCases.forEach(val => testMerging(val, complexObj, true))
    })

    it('should NOT validate by deeply nested obj (merging)', () => {
      const testCases = [
        [
          {
            id: 11,
            a: [
              {
                b: [1, 2, 'a'],
                c: [1.5, 2, 3],
                d: [1, 2, 3],
                e: ['aa', 'bb'],
              },
            ],
          },
        ],
      ]
      testCases.forEach(val => testMerging(val, complexObj, false))
    })
  })
})
