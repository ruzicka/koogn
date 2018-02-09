# xValidator


## Extensible

If you ever need greater expressibility in your validation needs, you are not
stuck 


## config

cacheSchemas: true
example: true

## alternative syntax

```javascript
validate(instance, example)
validate(instance).against(example)

isValid(instance, example)
validate(instance).isLike(example)

validate(instance).throwIfNotLike(example)

```
## Preapplied example

example provided in config

or

```javascript
const validate = validate.apply(example)
validate(instance)

isValid(instance, example)
validate(instance).isLike(example)

validate(instance).throwIfNotLike(example)

```



# xValidator

Schema-less validation library.
Very simple to use yet powerfull validation library.

The main difference when comparing to other validation libraries is that you don't
create schema to validate your data against. 

Let's say you want to validate this object:

```javascript
const book = {
  title: 'Best book ever',
  authors: ['David Ruzicka'],
  releaseDate: '2018-02-03',
}
```

To validate it by JSON schema you would need schema like this one:

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

xValidator doesn't need schema. It's validating objects and other data types simply by providing
example object.  

```javascript
const {isValid} = require('xvalidator').createValidator()

const example = {
  title: 'Best book ever',
  authors: ['David Ruzicka'],
  releaseDate: '2018-02-03',
}
const instance = {
  title: 'Book of the year',
  authors: ['John Smith', 'Jane Doe'],
  releaseDate: '2018-02-03',
}

isValid(instance, example) // returns true
```


## Usage

``` javascript
const validator = require('not-json-schema').createValidator()

validator.validate(yourData, {id: 1, name: 'text'})  // returns validation info

// alternatively you can use: 
validator.throwIfNotValid(yourData, {id: 1, name: 'text'})  // throws an error
validator.isValid(yourData, {id: 1, name: 'text'})  // true or false
```

## Types

### number

There are two numeric types: 
- integers
- numbers (both integers and floats)

``` javascript
{
  integerProperty: 1,
  floatProperty: 1.1
  integerProperty2: 2.0,  // beware decimal part
}
```
### string

simple strings:

```javascript
{
  stringProperty: 'some string'
}
```

In case you want to impose some format restriction, it is possible to specify some
of the predefined formats as a property value.

```javascript
{
  prop01: 'date',         // '2012-07-08'
  prop02: 'time',         // '16:41:41'
  prop03: 'date-time',    // '2012-07-08T16:41:41.532Z' (and variants)
  prop04: 'utc-millisec', // '1234567890'
  prop05: 'regex',
  prop16: 'regexp',
  prop17: 'pattern',
  prop08: 'color',
  prop09: 'style',
  prop10: 'phone',
  prop11: 'email',                    //DOPLNIT
  prop12: 'ip-address',
  prop13: 'ipv4',
  prop14: 'ipv6',
  prop15: 'uri',
  prop16: 'host-name',
  prop17: 'hostname',
  prop18: 'alpha',
  prop19: 'alphanumeric',
}
```

If you already have a template object and you don't want to rewrite properties values to
match certain format identifier, some formats are autodetected.

```javascript
{
  prop01: 'date',         // '2012-07-08'
  prop02: 'time',         // '16:41:41'
  prop03: 'date-time',    // '2012-07-08T16:41:41.532Z' (and variants)
  prop04: 'utc-millisec', // '1234567890'
  prop05: 'regex',
  prop16: 'regexp',
  prop17: 'pattern',
  prop08: 'color',
  prop09: 'style',
  prop10: 'phone',
  prop11: 'email',                    //DOPLNIT
  prop12: 'ip-address',
  prop13: 'ipv4',
  prop14: 'ipv6',
  prop15: 'uri',
  prop16: 'host-name',
  prop17: 'hostname',
  prop18: 'alpha',
  prop19: 'alphanumeric',
}
```


### object

required
Dependencies?
minProperties, maxProperties (asi nedelat)
regexp keys?


### array

uniqueItems?
minItems, maxItems


### boolean


### null

## More complex templates

Chances are that your project starts with only simple needs for object validation and
as it grows there may be necessary to handle more complex validation scenarios. Although
'not-json-schema' is intended mainly for simple validation, you don't need to replace
it with more complex solution as 'not-json-schema' can handle it quite fine.
  
For every property that needs more complex validation you can use special keyword
`$schema` to define full `jsonschema` for that property. You can use all the features
supported by `jsonschema`
  
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

## Optional items

By default all properties in provided validation object are considered to be
`required`. In case you want some of your object properties to be optional,
 you can use reserved `$optional` property:

``` javascript
validator.validate(yourData, {
    id: 1, 
    author: 'john',
    title: 'The Book',
    year: 1940,         // the only optional property
    $optional: ['year']
})
```

If you find your object to have more optional properties than required ones, use
`$required` instead. This changes default behaviour to assume every property is optional
except the ones specified in `$required`.

``` javascript
validator.validate(yourData, {
    id: 1,            // the only required field
    author: 'john',
    title: 'The Book',
    year: 1940,
    $required: ['id']
})
```



{
    object: {
        int: 50
    },
    int: 55,
    float: 44.5
    string: 'hello'
    date: 'hello'
    
}
