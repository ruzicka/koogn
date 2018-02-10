[![Build Status](https://travis-ci.org/ruzicka/koogn.svg?branch=master)](https://travis-ci.org/ruzicka/koogn)

# Koogn

Schema-less validation for JavaScript

## Introduction

Sooner or later you're gonna need to somehow verify that the data you're working with conforms to
what you expect them to be like. For example, that the email submitted to your API endpoint has
proper format or that the value that should be a number doesn't receive a string.

There's a plenty of great libraries for exactly that but all of them needs you to create some kind
of blueprint, a schema describing the structure of the data.

Koogn works differently. Instead of validating data (let's say a javascript object) against a schema,
it compares it to just another javascript object - an example. Koogn is smart, so it can analyze
structure of your example object and object you want to validate to make proper comparison. 

## Advantages

 - Very simple to use
 - You don't need to define schema, just use some `example` data
 - Most of the time you even don't need to prepare the `example`. You probably already have it. Your `example` data is the data you are testing your program/API/whathever with or the output it generates.
 - If you ever find yourself in need of a bit more complex validation scenarios, it's easy to extend your `example` using a simple syntax to get what you need.
 - There's no performance drawbacks for all these features (see more on that bellow)
 - Just by looking at it, the `example` data clearly communicates how the data should look like   

## Example

Let's say we want to validate this object:
```javascript
const book = {
  title: 'Saved by Koogn',
  authors: ['David Ruzicka'],
  releaseDate: '2018-02-03',
}
```

The only thing that we need is another object. `example` - the ethalon by which we will compare the `book`
object. 

```javascript
const {isValid} = require('koogn').createValidator()

const example = {
  title: 'Example',
  authors: ['John Smith', 'Joe Noel'],
  releaseDate: '1967-10-24',
}

isValid(example, book) // returns true
```

We've determined that the `book` object is valid. The structure is the same, types of the properties are the same and
the format of `releaseDate` field in both cases is the date. 

Just for comparison: To validate exactly the same things using JSON schema requires you to define schema like this:

```javascript
const schema = {
  type: 'object',
  properties: {
  title: {
    type: 'string',
      required: true
  },
  authors: {
    type: 'array',
      items: {
      type: 'string',
        required: true
    },
    required: true
  },
  releaseDate: {
    type: 'string',
      format: 'date',
      required: true
  }
}
```

## Usage

First install Koogn and save it to your project
```bash
npm install koogn --save
```

Then require the package and create validator instance. There are two ways how to do that:
``` javascript
const validator = require('koogn').createValidator()
```

or

``` javascript
const Validator = require('koogn').Validator
const validator = new Validator()
```

Both `createValidator` function and `Validator` constructor can receive configuration object to tweak validator behavior (more on that bellow) 

Once you have an validator instance you can use one of these methods to perform validation.

**validate(example, instance)** performs validation of `instance` against provide `example` and returns full validation report.  

**isValid(example, instance)** performs validation of `instance` against provide `example` and returns simple true/false if `instance` is valid or not.
  
**throwIfNotValid(example, instance)** performs validation of `instance` against provide `example` and if `instance` is not valid, throws an `ValidationError`.  

``` javascript
const validator = require('koogn').createValidator()

const bookExample = {
  title: 'Example',
  authors: ['John Smith', 'Joe Noel'],
  releaseDate: '1967-10-24',
}

const instance = {
  title: 'Saved by Koogn',
  authors: ['David Ruzicka'],
  releaseDate: '2018-02-03',
}

validator.validate(bookExample, instance)

validator.isValid(bookExample, instance)

validator.throwIfNotValid(bookExample, instance)
```

All three of those methods can also return validation function with first parameter
already pre-applied. Using it this way is also more performant solution as the
conversion from example object to internal schema needs to happen just once. Let's
demonstrate on `isValid`:

``` javascript

const isValidBook = validator.isValid(bookExample)  // create test function

isValidBook(instance)
```
  
 
## Optional / required properties

By default all properties in provided `example` object are considered to be
`required`. In case you want some of your object properties to be optional,
 you can use reserved property `$optional` and pass property name that should
 be optional or the array of them:

``` javascript
validator.validate({
    id: 1, 
    author: 'john',     // optional property
    title: 'The Book',  
    year: 1940,         // optional property
    $optional: ['year', 'author']
}, yourData)
```

If you find your object to have more optional properties than required ones, use
`$required` instead. This changes default behaviour and assumes every property is now optional
except the ones specified in `$required`.

``` javascript
validator.validate({
    id: 1,            // the only required field
    author: 'john',
    title: 'The Book',
    year: 1940,
    $required: 'id'
}, yourData)
```


## More complex validations

Chances are that your project starts with only simple validation needs. But as your project
grows it may be necessary to handle more complex validation scenarios. Although
`Koogn` is mainly intended for simple validation, it can handle even 
complex validations by utilizing reserved key `$schema`. Through it you can define full `jsonschema` for the property with all the features
supported by `jsonschema`
  
In the example bellow validation of `labels` property is completely overriden by provided schema:   
``` javascript
{
  id: 11,
  name: 'john',
  labels: {
    $schema: {
      type: 'array', 
      items: {
        type: 'string',
        minLength: 2,
        maxLength: 100
      }
    }
  },
}
```  


## Configuration


There's a number of options through which you can configure validator.
These are default values:
```javascript
const options = {
  arrays: {
    mode: 'all', // first|uniform|all 
  },
  strings: {
    formatDetectionMode: 'both', // none|name|content|both
  },
  objects: {
    additionalProperties: false, // false|true
  },
}
```

Options should be passed as a parameter to `createValidator` function

```javascript
const {createValidator} = require('./lib/validator')
const validator = createValidator({arrays: {mode: 'first'}})
``` 

or as a parameter to a `Validator` constructor:

```javascript
const {Validator} = require('./lib/validator')
const validator = new Validator({arrays: {mode: 'first'}})
``` 

Whatever you like better

### arrays options

**arrays.mode** (`all|first|uniform` default is `all`)

This option has effect only on arrays containing two or more items   
  
`first` - This option takes into account just the first item in any array Rest is ignored.
  
`uniform` - This option makes sure that if there are more items all of them shares the same type and structure.
if not, it throws an error.  
  
`all` - If provided `example` object contains array of items with mutually incompatible
types/structures, parser will try to come up with least common type/structure and validate against that.
It works in a natural way.

If your `example` object contains array of items sharing the same type, than validator imposes
that type restriction on array items:

```javascript
const {isValid} = require('./lib/validator').createValidator({arrays: {mode: 'all'}})
const example = [1, 3, 4]

isValid(example, [1, 2])      // true
isValid(example, ['a', 'b'])  // false
isValid(example, [1, 2, 'a']) // false
isValid(example, {a: 1})      // false
```

If your `example` object contains array of mixed numbers and strings, validator assumes that such an
array can contain mixture of types so it doesn't impose type restriction on array items:

```javascript
const {isValid} = require('./lib/validator').createValidator({arrays: {mode: 'all'}})
const example = ['str', 3, 4]

isValid(example, [1, 2])      // true
isValid(example, ['a', 'b'])  // true
isValid(example, [1, 2, 'a']) // true
isValid(example, {a: 1})      // false
```

If your `example` object contains array of objects that shares the same structure. Only objects having the same
structure will pass validation

```javascript
const {isValid} = require('./lib/validator').createValidator({arrays: {mode: 'all'}})
const example = [
  {a: 1, b: 'str'},
  {a: 56, b: 'something'}
]

isValid(example, [{a: 3, b: 'xxx'}, {a: 588, b: 'aaa'}])  // true
isValid(example, [{a: 3, b: 'xxx'}, {a: 588}])            // false (second item is missing property 'b')
isValid(example, [{a: 3, b: 'xxx'}, {a: 588, b: 11}])     // false (b of second item is not string)
isValid(example, [{a: 3, b: 'xxx'}, 22])                  // false (second item is not object)
isValid(example, ['a', 'b'])                              // false (none of the items is object)
```

If your `example` object contains array of objects that doesn't share the same structure. Than the only restriction
applied on array items is to be an object 

```javascript
const {isValid} = require('./lib/validator').createValidator({arrays: {mode: 'all'}})
const example = [
  {a: 1, b: 'str'},
  {a: 56, c: [1]} // structure is different than first item
]

isValid(example, [{a: 3, b: 'xxx'}, {a: 588, b: 'aaa'}])  // true
isValid(example, [{a: 3, b: 'xxx'}, {a: 588}])            // true (structure doesn't matter)
isValid(example, [{a: 3, b: 'xxx'}, {a: 588, b: 11}])     // true (structure doesn't matter)
isValid(example, [{a: 3, b: 'xxx'}, 22])                  // false (second item is not object)
isValid(example, ['a', 'b'])                              // false (none of the items is object)
```

If your `example` object contains array of items sharing the same type, than validator imposes
that type restriction on array items:



### objects options

**objects.additionalProperties** (`true|false` default is `false`)

If this option is set to `true` then object having extra properties than `example`
object will still be validated  

### strings options

**strings.formatDetectionMode** (`none|name|content|both` default is `both`)

`none` - Validator will make no attempt to detect format of strings in provided
`example` object

`name` - If string value in provided `example` object matches one from the list
bellow, restriction for that format will apply.

```javascript
{
  prop01: 'date',         // '2012-07-08'
  prop02: 'time',         // '16:41:41'
  prop03: 'date-time',    // '2012-07-08T16:41:41.532Z' (and variants)
  prop04: 'utc-millisec', // '1234567890'
  prop05: 'regex',        // '/a/'
  prop08: 'color',        // '#ff0000'
  prop09: 'style',        // 'color: red;'
  prop10: 'phone',        // '+31 42 123 4567'
  prop11: 'email',        // 'john@smith.com'            
  prop12: 'ip-address',   // '192.168.0.1'
  prop13: 'ipv4',         // '192.168.0.1'
  prop14: 'ipv6',         // 'fe80::1%lo0'
  prop15: 'uri',          // 'http://www.google.com/'
  prop16: 'host-name',    // 'www.google.com'
  prop17: 'hostname',     // 'www.google.com'
  prop18: 'alpha',        // 'abracadabra'
  prop19: 'alphanumeric', // 'abracadabra123'
}
```

example:
```javascript
const {isValid} = require('./lib/validator').createValidator({arrays: {stings: 'name'}})
const example = {updatedAt: 'date-time'}

isValid(example, {updatedAt: '2012-07-08T16:41:41.532Z'})  // true
isValid(example, {updatedAt: 'hello'})                     // false
isValid(example, {updatedAt: 11})                          // false
```

`content` - Similar to `name` option but format is autodetected from the value itself
example:
```javascript
const {isValid} = require('./lib/validator').createValidator({arrays: {mode: 'content'}})
const example = {updatedAt: '2018-01-01T20:15:31.532Z'}

isValid(example, {updatedAt: '2012-07-08T16:41:41.532Z'})  // true
isValid(example, {updatedAt: 'hello'})                     // false
isValid(example, {updatedAt: 11})                          // false
```

`both` - Combination of both `name` and `content` options
example:
```javascript
const {isValid} = require('./lib/validator').createValidator({arrays: {mode: 'content'}})
const example = {
  updatedAt: '2018-01-01T20:15:31.532Z',
  createdAt: 'date'
}

isValid(example, {updatedAt: '2012-07-08T16:41:41.532Z', createdAt: '2011-10-01'}) // true
isValid(example, {updatedAt: 'hello', createdAt: '2011-10-01'})                    // false
isValid(example, {updatedAt: '2012-07-08T16:41:41.532Z', createdAt: 'hello'})      // false
```
