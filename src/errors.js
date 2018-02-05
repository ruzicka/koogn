'use strict'

class BaseError extends Error {
  constructor(message, code) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.code = code
  }
}

class ValidationError extends BaseError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR')
  }
}

class InvalidExampleError extends BaseError {
  constructor(message) {
    super(message || 'Validation example is invalid', 'INVALID_EXAMPLE_ERROR')
  }
}

module.exports = {
  ValidationError,
  InvalidExampleError,
}
