'use strict'

const sinon = require('sinon')
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

const movie = {
  id: 12434,
  title: 'Movie of the Year',
  actors: ['actor 1', 'actor 2'],
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


  it('not matching schema - 1 param mode', () => {
    const isValid = defaultValidator.isValid(book)
    const validate = defaultValidator.validate(book)
    const throwIfNotValid = defaultValidator.throwIfNotValid(book)

    expect(isValid(notMatchingInstance)).to.be.false
    expect(validate(notMatchingInstance)).to.have.property('errors')
      .that.is.an('array').with.length.above(0)
    expect(() => throwIfNotValid(notMatchingInstance)).to.throw(ValidationError)
  })

  it('matching schema - 1 param mode', () => {
    const isValid = defaultValidator.isValid(book)
    const validate = defaultValidator.validate(book)
    const throwIfNotValid = defaultValidator.throwIfNotValid(book)

    expect(isValid(matchingInstance)).to.be.true
    expect(validate(matchingInstance)).to.have.property('errors')
      .that.is.an('array').with.lengthOf(0)
    expect(() => throwIfNotValid(matchingInstance)).to.not.throw(ValidationError)
  })


  describe('json schema conversion happens just once in 1 param mode', () => {

    beforeEach(() => {
      sinon.spy(defaultValidator, 'getSchema')
    })

    it('validate', () => {
      expect(defaultValidator.getSchema.callCount).to.equal(0)
      const validateBook = defaultValidator.validate(book)
      validateBook(matchingInstance)
      expect(defaultValidator.getSchema.callCount).to.equal(1)
      validateBook(notMatchingInstance)
      expect(defaultValidator.getSchema.callCount).to.equal(1)

      const validateMovie = defaultValidator.validate(movie)
      expect(defaultValidator.getSchema.callCount).to.equal(2)
      validateMovie(notMatchingInstance)
    })

    it('isValid', () => {
      expect(defaultValidator.getSchema.callCount).to.equal(0)
      const isValidBook = defaultValidator.isValid(book)
      isValidBook(matchingInstance)
      expect(defaultValidator.getSchema.callCount).to.equal(1)
      isValidBook(notMatchingInstance)
      expect(defaultValidator.getSchema.callCount).to.equal(1)

      const isValidMovie = defaultValidator.isValid(movie)
      expect(defaultValidator.getSchema.callCount).to.equal(2)
      isValidMovie(notMatchingInstance)
    })

    it('throwIfNotValid', () => {
      expect(defaultValidator.getSchema.callCount).to.equal(0)
      const throwIfNotValidBook = defaultValidator.throwIfNotValid(book)
      throwIfNotValidBook(matchingInstance)
      expect(defaultValidator.getSchema.callCount).to.equal(1)
      expect(() => throwIfNotValidBook(notMatchingInstance)).to.throw()
      expect(defaultValidator.getSchema.callCount).to.equal(1)

      const throwIfNotValidMovie = defaultValidator.throwIfNotValid(movie)
      expect(defaultValidator.getSchema.callCount).to.equal(2)
      expect(() => throwIfNotValidMovie(notMatchingInstance)).to.throw()
    })


    afterEach(() => {
      defaultValidator.getSchema.restore()
    })

  })

})
