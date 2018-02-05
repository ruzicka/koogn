'use strict'

const {createValidator} = require('../../src')

const mergingValidator = createValidator({arrays: {mode: 'all'}})
const nonMergingValidator = createValidator({arrays: {mode: 'first'}})
const uniformValidator = createValidator({arrays: {mode: 'uniform'}})
const standardValidator = createValidator()

const {expect} = require('chai')

const createTestFunction = validator => (testedInstance, example, expected) => {
  expect(validator.isValid(testedInstance, example)).to.equal(expected)
}

const createTest = (arrayMergeMode, formatDetectionMode) => createTestFunction(createValidator({
  arrays: {
    mode: arrayMergeMode,
  },
  strings: {
    formatDetectionMode,
  },
}))

const testMerging = createTestFunction(mergingValidator)
const testNonMerging = createTestFunction(nonMergingValidator)
const testBoth = (testedInstance, example, expected) => {
  testMerging(testedInstance, example, expected)
  testNonMerging(testedInstance, example, expected)
}

const testSNone = createTest('all', 'none')
const testSName = createTest('all', 'name')
const testSContent = createTest('all', 'content')
const testSBoth = createTest('all', 'both')

module.exports = {
  testBoth,
  testMerging,
  testNonMerging,
  testSNone,
  testSName,
  testSContent,
  testSBoth,
  standardValidator,
  uniformValidator,
}
