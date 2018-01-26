'use strict'

const {expect} = require('chai')
const {createValidator} = require('../src')
const ValidationError = require('../src/ValidationError')

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
    expect(() => defaultValidator.isValid(book)).to.throw(ValidationError, 'Invalid example')
  })

  it('not matching schema', () => {
    expect(defaultValidator.isValid(notMatchingInstance, book)).to.be.false
    expect(defaultValidator.validate(notMatchingInstance, book)).to.have.property('errors')
      .that.is.an('array').with.length.above(0)
    expect(() => defaultValidator.throwIfNotValid(notMatchingInstance, book)).to.throw(ValidationError)
  })

  it('matching schema', () => {
    expect(defaultValidator.isValid(matchingInstance, book)).to.be.true
    expect(defaultValidator.validate(matchingInstance, book)).to.have.property('errors')
      .that.is.an('array').with.lengthOf(0)
    expect(() => defaultValidator.throwIfNotValid(matchingInstance, book)).to.not.throw(ValidationError)
  })
})
