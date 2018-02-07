'use strict'

const {expect} = require('chai')
const {createValidator} = require('../src')
const {ValidationError, InvalidExampleError} = require('../src/errors')

const defaultValidator = createValidator()

const book = {
  id: 11,
  title: 'The Undesired Princess and the Enchanted Bunny',
  authors: [
    {
      id: 23,
      firstName: 'David',
      lastName: 'Drake',
      born: '1945-09-24',
      rating: 1.67,
    },
    {
      id: 56,
      firstName: 'Lyon',
      lastName: 'Sprague de Camp',
      born: '1908-11-27',
      rating: 4,
    },
  ],
}

const notMatchingInstance = {
  id: 1,
  title: 'The Undesired Princess',
  author: 'Dave',
}

const matchingInstance = {
  id: 1,
  title: 'The Undesired Princess',
  authors: [
    {
      id: 3,
      firstName: 'Dave',
      lastName: 'Drak',
      born: '1941-08-24',
      rating: 1.2,
    },
  ],
}

describe('Validator', () => {

  it('invalid example', () => {
    expect(() => defaultValidator.isValid(undefined, book)).to.throw(InvalidExampleError, 'Validation example is invalid')
  })

  it('not matching schema', () => {
    expect(defaultValidator.isValid(book, notMatchingInstance)).to.be.false
    expect(defaultValidator.validate(book, notMatchingInstance)).to.have.property('errors')
      .that.is.an('array').with.length.above(0)
    expect(() => defaultValidator.throwIfNotValid(book, notMatchingInstance)).to.throw(ValidationError)
  })

  it('matching schema', () => {
    expect(defaultValidator.isValid(book, matchingInstance)).to.be.true
    expect(defaultValidator.validate(book, matchingInstance)).to.have.property('errors')
      .that.is.an('array').with.lengthOf(0)
    expect(() => defaultValidator.throwIfNotValid(book, matchingInstance)).to.not.throw(ValidationError)
  })
})
