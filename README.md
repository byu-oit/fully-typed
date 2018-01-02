[![Build status](https://img.shields.io/travis/byu-oit/fully-typed.svg?style=flat)](https://travis-ci.org/byu-oit-appdev/fully-typed)
[![Coverage Status](https://coveralls.io/repos/github/byu-oit/fully-typed/badge.svg?branch=master)](https://coveralls.io/github/byu-oit-appdev/fully-typed?branch=master)

# fully-typed

Run time type validation, transformation, and error generator that works out of the box on primitives, objects, arrays, and nested objects. Also extensible for custom types.

[Skip to Table of Contents](#table-of-contents)

### Features

- Create schemas to validate values against.
- Built in support for arrays, booleans, functions, numbers, objects, strings, and symbols.
- Extensible - use plugins or create your own to integrate more types.
- Get detailed error messages when a wrong value is run against a schema.
- Auto throw errors when normalizing or validating.

**Example**

```js
const Typed = require('fully-typed');

const schema = Typed({
    type: Number,
    default: 0
});

// will only add numbers, throws errors otherwise
exports.add = function (a, b) {
    a = schema.normalize(a);    // throw an error if not a number or if undefined defaults to 0
    b = schema.normalize(b);
    return a + b;
};
```

**Example**

```js
const Typed = require('fully-typed');

const schema = Typed({
    type: Object,
    properties: {
        name: {
            required: true,
            type: String,
            minLength: 1
        },
        age: {
            type: Number,
            min: 0
        },
        employed: {
            type: Boolean,
            default: true
        }
    }
});

function addPerson(configuration) {
    const config = schema.normalize(configuration); // If the input is invalid an error is thrown
                                                    // with specifics as to why it failed
    // ... do more stuff
}

```

**Example**

```js
const Typed = require('fully-typed');

// define a schema
const positiveIntegerSchema = Typed({
    type: Number,
    default: 100,
    min: 0,
    integer: true
});

// default value used
const value = positiveIntegerSchema.normalize(undefined);     // value === 100

// check for errors - valid values
positiveIntegerSchema.error(0);         // null - no error
positiveIntegerSchema.error(1);         // null - no error

// check for errors - invalid values
positiveIntegerSchema.error(-1);        // Invalid number. Must be greater than or equal to 0. Received: -1
positiveIntegerSchema.error(1.2);       // Invalid number. Must be an integer. Received: 1.2
positiveIntegerSchema.error('1');       // Invalid value. Expected a number. Received: "1"

// throw errors
positiveIntegerSchema.validate(-1);     // throws error
positiveIntegerSchema.normalize(-1);    // validate will run prior to normalization - throws error
```

## Table of Contents

- [Schema Configurations](#schema-configurations)
    - [Shared Configuration Options](#shared-configuration-options)
    - [Array](#array)
    - [Boolean](#boolean)
    - [Date](#date)
    - [Function](#function)
    - [Number](#number)
    - [Object](#object)
    - [One-Of](#one-of)
    - [String](#string)
    - [Symbol](#symbol)
- [Schema Instance](#schema-instance)
    - [config](#config)
    - [error](#error)
    - [normalize](#normalize)
    - [validate](#validate)
- [Plugins](#plugins)
    - [Use an Existing Plugin](#use-an-existing-plugin)
    - [Write a Plugin](#write-a-plugin)
- [Controller API](#controller-api)
    - [register](#register)
    - [delete](#delete)
    - [get](#get)
    - [has](#has)
    - [is](#is)
    - [list](#list)


## Schema Configurations

### Shared Configuration Options

All types defined share the following common configuration options:

- *default* - A value to use during [normalization](#normalize) if the value is `undefined`. This is especially useful for the properties of [object configurations](#object).

    ```js
    const schema = Typed({
        default: 'Hello, World!'
    });

    const value1 = schema.normalize('Hello, Bob!');     // value1 === 'Hello, Bob!'
    const value2 = schema.normalize();                  // value2 === 'Hello, World!'
    ```

- *enum* - (Array) A non-empty array of acceptable values. Values are compared using triple equals `===`.

    ```js
    const schema = Typed({
        enum: ['A', 2, null]
    });

    // these do not produce errors
    schema.error('A');
    schema.error(2);
    schema.error(null);

    // these do produce errors
    schema.error('a');
    schema.error(1);
    schema.error({});
    ```

- *transform* - (Function) This function is only run during [normalization](#normalize). It receives the validated value and must return a value. The value returned will be the result of [normalization](#normalize).

    ```js
    // a schema that normalizes any value to a boolean
    const schema = Typed({
        transform: function(value) {
            return !!value;
        }
    });
    ```

- *validator* - (Function) This function provides an easy method for adding some custom validation to a schema. The validator will be passed the value as its only parameter. Returning a truthy value means the value is valid, returning a string or a falsy value signifies an invalid value. If a string is returned then the value for the string is placed in the error message.

    ```js
    // good luck getting this to validate
    const schema = Typed({
        validator: function(value) {
            const num = Math.random();
            return value === num
                ? true
                : 'The only acceptable value is ' + num;
        }
    });
    ```

*[Back to Table of Contents](#table-of-contents)*

### Array

An array type will require the input to be an array.

Type Aliases: `'array'`, `Array`

In addition to the [shared configuration options](#shared-configuration-options) it also has these options:

- *maxItems* - (Number) The maximum number of items that the array can contain. Defaults to `undefined`.

- *minItems* - (Number) The minimum number of items that the array must contain. Defaults to `0`.

- *schema* - (Object) A configuration schema to apply to each item in the array. For example, you can specify that the array must be an array of numbers.

    ```js
    // schema is for an array of numbers
    const schema = Typed({
        type: Array,
        schema: {
            type: Number
        }
    });
    ```

- *uniqueItems* - (Boolean) If set to true then each item in the array must be unique. Defaults to `false`.

    ```js
    const schema = Typed({
        type: Array,
        uniqueItems: true
    });

    schema.error([1, 'b']);     // no errors
    schema.error([1, 1]);       // error
    ```

*[Back to Table of Contents](#table-of-contents)*

### Boolean

An boolean type will accept any value and transform it into a boolean unless the `strict` option is set. Under `strict` this type will only accept a boolean.

Type Aliases: `'boolean'`, `Boolean`

In addition to the [shared configuration options](#shared-configuration-options) it also has this option:

- *strict* - (Boolean) Set to true to require that the type be a boolean. Defaults to `false`.

    ```js
    const loose = Typed({
        type: Boolean
    });

    const strict = Typed({
        type: Boolean,
        strict: true
    });

    loose.error(1);         // no errors
    strict.error(1);        // error
    strict.error(true);     // no errors

    const value = loose.normalize(1);   // value === true
    ```

*[Back to Table of Contents](#table-of-contents)*
    
### Date

A date type will require that the input be a valid Date or that it be a value that can be converted to a valid Date.

Type Aliases: `'date'`, `Date`

In addition to the [shared configuration options](#shared-configuration-options) it also has these options:

- *max* - (Date, string, number) The maximum allowed date value. Defaults to `undefined`.

    ```js
    const schema = Typed({
        type: Date,
        max: '2017-01-01'
    });

    schema.error(new Date('2015-01-01'));         // no errors
    schema.error(new Date('2017-02-01'));         // error
    ```

- *min* - (Date, string, number) The minimum allowed date value. Defaults to `undefined`.

    ```js
    const schema = Typed({
        type: Date,
        min: '2017-01-01'
    });

    schema.error(new Date('2017-02-01'));         // no errors
    schema.error(new Date('2015-01-01'));         // error
    ```

*[Back to Table of Contents](#table-of-contents)*

### Function

An function type will require the input to be a function.

Type Aliases: `'function'`, `Function`

In addition to the [shared configuration options](#shared-configuration-options) it also has these options:

- *maxArguments* - (Number) The maximum number of arguments that the function can define as parameters. Defaults to `undefined`.

    ```js
    const schema = Typed({
        type: Function,
        maxArguments: 0
    });

    schema.error(function() {});    // no errors
    schema.error(function(a) {});   // error
    ```

- *minArguments* - (Number) The minimum number of arguments that the function can define as parameters. Defaults to `0`.

    ```js
    const schema = Typed({
        type: Function,
        minArguments: 3
    });

    schema.error(function(a, b,  c) {});    // no errors
    schema.error(function() {});            // error
    ```

- *named* - (Boolean) Require the function to be named. Defaults to `false`.

    ```js
    const schema = Typed({
        type: Function,
        named: true
    });

    schema.error(function foo() {});    // no errors
    schema.error(function() {});        // error
    ```

*[Back to Table of Contents](#table-of-contents)*

### Number

An number type will require the input to be a number.

Type Aliases: `'number'`, `Number`

In addition to the [shared configuration options](#shared-configuration-options) it also has these options:

- *exclusiveMax* - (Boolean) Whether the maximum value should be included as allowed or not. Defaults to `false`.

    ```js
    const schema = Typed({
        type: Number,
        exclusiveMax: true,
        max: 1
    });

    schema.error(.999);     // no errors
    schema.error(1);        // error
    ```

- *exclusiveMin* - (Boolean) Whether the minimum value should be included as allowed or not. Defaults to `false`.

    ```js
    const schema = Typed({
        type: Number,
        exclusiveMin: true,
        min: 1
    });

    schema.error(1.001);    // no errors
    schema.error(1);        // error
    ```

- *integer* - (Boolean) Whether the value must be an integer. Defaults to `false`.

    ```js
    const schema = Typed({
        type: Number,
        integer: true
    });

    schema.error(1);        // no errors
    schema.error(1.2);      // error
    ```

- *max* - (Number) The maximum allow value. Defaults to `undefined`.

    ```js
    const schema = Typed({
        type: Number,
        max: 1
    });

    schema.error(-1);       // no errors
    schema.error(1);        // no errors
    schema.error(2);        // error
    ```

- *min* - (Number) The minimum allow value. Defaults to `undefined`.

    ```js
    const schema = Typed({
        type: Number,
        min: 1
    });

    schema.error(-1);       // error
    schema.error(1);        // no errors
    schema.error(2);        // no errors
    ```

*[Back to Table of Contents](#table-of-contents)*

### Object

An object type will require the input to be an object. You can also specify which properties are required and the schema expected for individual properties.

Normalization of this type produces a new object.

Type Aliases: `'object'`, `Object`

In addition to the [shared configuration options](#shared-configuration-options) it also has these options:

- *allowNull* - (Boolean) Whether `null` is an acceptable value. Defaults to `true`.

    ```js
    const nullSchema = Typed({
        type: Object,
        allowNull: true
    });

    const notNullSchema = Typed({
        type: Object
    });

    nullSchema.error({});       // no errors
    nullSchema.error(null);     // no errors
    notNullSchema.error({});    // no errors
    notNullSchema.error(null);  // error
    ```

- *clean* - (Boolean) During [normalization](#normalize) remove any properties that are not defined in the schema's properties. Defaults to `false`.

    ```js
    const schema = Typed({
        type: Object,
        clean: true,
        properties: {
            name: {
                type: String,
                minLength: 1,
                required: true      // name is required, age is optional
            },
            age: {
                type: Number,
                min: 0,
                integer: true
            }
        }
    });

    const value = schema.normalize({    // value === { name: 'Bob', age: 5 }
        name: 'Bob',
        age: 5,
        location: 'Utah'
    });
    ```

- *properties* - (Object) Define the properties that can be part of this object. Each property takes a full schema configuration. Each property is also given a `required` property that can be set to true.

    ```js
    const schema = Typed({
        type: Object,
        properties: {
            name: {
                type: String,
                minLength: 1,
                required: true      // name is required, age is optional
            },
            age: {
                type: Number,
                min: 0,
                integer: true
            }
        }
    });

    schema.error({ name: 'Bob' });  // no errors
    schema.error({});               // error
    ```

- *schema* - (Object) A configuration schema to apply to each property on the object. This is useful for allowing objects to have any property but requiring that each property adhere to a schema. If specific properties are defined then the schema defined here will be extended by and superseded by the specific property's schema.

    ```js
    const schema = Typed({
        type: Object,

        // schema specifics for a single property extend the general schema
        properties: {
            name: {
                // the type is inherited as String
                minLength: 1,       // min length of 1 overwrites general min length of 10
                required: true      // name is required
            },
            age: {
                // because this property is of type Number the non-number properties
                // in the general schema definition are ignored
                type: Number
            }
        },

        // a generic schema to apply to all properties within the object
        schema: {
            type: String,
            minLength: 10
        }
    });

    schema.error({ name: 'Bob' });  // no errors
    schema.error({});               // error
    ```

    The following example shows a [one-of](#one-of) general schema definition. All variations of the general schema are possible extensions across the property specific schemas.

    ```js
    const schema = Typed({
        type: Object,

        // schema specifics for a single property extend the general schema
        properties: {
            name: {
                type: String,       // because this is a string it will extend
                                    // the String specific general schema
                minLength: 1
            },
            age: {
                // because this property is of type Number it extends one of the generic number schemas
                type: Number
            },
            foo: {
                // the type might be a String or Number
                min: 5,             // this property will only apply if the type is a number and
                                    // it will supersede the general min value
                minLength: 1,       // this property will only apply if the type is a string
                required: true      // name is required
            }
        },

        // a generic schema to apply to all properties within the object
        schema: [
            {
                type: String,
                maxLength: 10
            },
            {
                type: Number,
                min: 0,
                max: 10
            },
            {
                type: Number,
                min: 20,
                max: 30
            }
        ]
    });

    schema.error({ name: 'Bob' });  // no errors
    schema.error({});               // error
    ```

*[Back to Table of Contents](#table-of-contents)*

### One-Of

It is possible to allow multiple variations of schemas. For example, you may want to allow numbers and strings.

```js
const schema = Typed({
    type: Typed.OneOf,
    oneOf: [
        {
           type: Number,
           min: 0
        },
        {
           type: String
        }
    ]
});

schema.error('Foo');    // no errors
schema.error(1);        // no errors
schema.error(-1);       // error
schema.error(true);     // error
```

*[Back to Table of Contents](#table-of-contents)*

### String

A string type will require the input to be a string.

Type Aliases: `'string'`, `String`

In addition to the [shared configuration options](#shared-configuration-options) it also has these options:

- *maxLength* - (Number) The maximum length to allow for the string. Defaults to `undefined`.

    ```js
    const schema = Typed({
        type: String,
        maxLength: 3
    });

    schema.error('foo');     // no errors
    schema.error('food');    // error
    ```

- *minLength* - (Number) The minimum length to allow for the string. Defaults to `0`.

    ```js
    const schema = Typed({
        type: String,
        minLength: 1
    });

    schema.error('a');     // no errors
    schema.error('');      // error
    ```

- *pattern* - (RegExp) A regular expression object to test against the string. Defaults to `undefined`.

    ```js
    const schema = Typed({
        type: String,
        pattern: /^[a-z]$/i
    });

    schema.error('a');     // no errors
    schema.error('1');     // error
    ```

*[Back to Table of Contents](#table-of-contents)*

### Symbol

A symbol type will require the input to be a symbol.

Type Aliases: `'symbol'`, `Symbol`

This type inherits the [shared configuration options](#shared-configuration-options) and has no options of its own.

*[Back to Table of Contents](#table-of-contents)*

## Schema Instance

A schema is generated by passing a [schema configuration](#schema-configurations) into the Typed function:

```js
const Typed = require('fully-typed');

// define a schema
const schema = Typed({
    type: Number
})
```

Once a schema is created you can [check a value for errors](#error), [normalize a value](#value), or [validate a value](#validate).

*[Back to Table of Contents](#table-of-contents)*

### config

Get a copy of the configuration that was used to define the schema for the current instance.

```js
const schema = Typed({
    type: Object,
    allowNull: false
})

const config = schema.config; // => { type: Object, allowNull: false }
```

### error

Test a value for errors. If the value does produce an error then a string is returned that details the cause of the error.

**Parameters**

- *value* - The value to do error checking on.

- *prefix* - An optional string to append to the beginning of an error message. Defaults to an empty string: `''`.

**Returns** `null` if no errors otherwise a string with error details.

```js
const schema = Typed({
    type: Number
});

schema.error(1);        // null
schema.error('a');      // "Expected a number"
```

*[Back to Table of Contents](#table-of-contents)*

### normalize

[Validate](#validate) a value and if an error is not thrown then begin normalization. Normalization differs for different types, but the essential role is to get the value into a state where you are ready to work with it. For example, booleans are normalized to `true` or `false` from truthy or falsy values respectively.

**Parameters**

- *value* - The value to normalize.

**Returns** The new value.

```js
const schema = Typed({
    type: Boolean
});

const value1 = schema.normalize(1);      // value1 === true
const value2 = schema.normalize(null);   // value2 === false
```

*[Back to Table of Contents](#table-of-contents)*

### validate

The validate function [checks for errors](#error) and if there is one it throws an error.

**Parameters**

- *value* - The value to run validation on.

- *prefix* - An optional string to append to the beginning of an error message. Defaults to an empty string: `''`.

**Returns** undefined.

```js
const schema = Typed({
    type: Number
});

schema.validate(1);     // no error thrown
schema.validate('a');   // throws an error
```

*[Back to Table of Contents](#table-of-contents)*

## Plugins

The fully typed library can be extended with new types.

### Use an Existing Plugin

1. [Find an Existing Plugin](https://www.npmjs.com/browse/keyword/fully-typed)
 
2. Require the plugin in your project along with `fully-typed`.

3. Register the plugin with `fully-typed`.
    
    ```js
    const FullyTyped = require('fully-typed');
    const plugin = require('some-full-typed-plugin');
    
    FullyTyped.controllers.register(plugin);
    ```

4. Now you can create schema's that use that plugin's type and associated configurations.

*[Back to Table of Contents](#table-of-contents)*

### Write a Plugin

A plugin is created by defining a typed controller. [See the example](#typeddate-controller-example).
 
1. Define a constructor function that accepts a configuration as it's only parameter.

    ```js
    function MyController (config) { }
    ```

2. Define and validate the configuration properties that are important to your controller.

3. Define the controller's properties. These are often similar or derived from the configuration properties.

4. Optionally define the error generator function on the prototype of the controller. This function will be used for normalization and validation. 

    ```js
    MyController.prototype.error = function (value, prefix) { }
    ```

    This function will receive two parameters when called: 1) the value to validate, 2) a prefix to add to the beginning of any returned error messages.

    This function should return a string with an error message if an invalid value is passed in, otherwise it should return `null`.
    
5. Optionally define the normalize function. This function will be called after passing validation and can make any transformations to the value. 

    ```js
    MyController.prototype.normalize = function (value) { }
    ```
    
    This function receives the value parameter. It must return the normalized value.
    
6. Provide the registration directive. This tells `full-typed` what aliases to assign to your controller and what dependencies this controller has. All controllers will automatically inherit from the Typed core controller.

    ```js
    MyController.register = {
        aliases: ['my-controller'],
        dependencies: []
    }
    ```
    
    The alias can be any value (primitive or object) but each alias must be unique within the entire system of typed controllers. The dependencies can reference the typed controllers by any alias they are registered with.
    
7. Register your controller.

*[Back to Table of Contents](#table-of-contents)*

#### TypedDate Controller Example

This is one of the built in controllers, but here it is documented to help you create your own controllers / plugins.

```js
module.exports = TypedDate;

// #1 - Define the controller constructor
function TypedDate (config) {
    const max = toDate(config.max);
    const min = toDate(config.min);

    // #2 - define and validate configuration properties
    if (config.hasOwnProperty('max') && !max) {
        throw Error('Property max could not be converted to a valid date. Received: ' + config.max);
    }
    if (config.hasOwnProperty('min') && !min) {
        throw Error('Property min could not be converted to a valid date. Received: ' + config.min);
    }
    if (max !== undefined && min !== undefined && min > max) {
        throw Error('The max date value must be greater than or equal to the min date value.');
    }

    // #3 - define the controller's properties
    Object.defineProperties(this, {
        max: {
            value: max
        },
        min: {
            value: min
        }
    });
}

// #4 - Define the error generator function
TypedDate.prototype.error = function(value, prefix) {
    const d = toDate(value);
    if (!d) return prefix + 'Value cannot be converted to a valid date: ' + value;
    if (this.max && d > this.max) return prefix + 'Value must be less than or equal to the max date value.';
    if (this.min && d < this.min) return prefix + 'Value must be greater than or equal to the min date value.';
    return null;
};

// #5 - define the normalize function
TypedDate.prototype.normalize = function(value) {
    return toDate(value);
};

// #6 - define the registration directive
TypedDate.register = {
    aliases: ['date', Date],
    dependencies: []
};

function toDate(value) {
    const d = value instanceof Date
        ? value
        : new Date(value);
    return isNaN(+d) ? undefined : d;
}
```

Finally, we need to register the controller:

```js
const FullyTyped = require('fully-typed');
FullyTyped.controllers.register(TypedDate);
```

*[Back to Table of Contents](#table-of-contents)*

## Controller API

### Register

Register a controller with the typed system to enable use of the type. You will need this function if you are including types from other libraries or if you are writing your own typed controller.

**Parameters**

- *controller* - A valid controller function as defined in the [Write a Plugin](#write-a-plugin) section. 

**Returns** undefined.

```js
Typed.controllers.register ( controller );
```

*[Back to Table of Contents](#table-of-contents)*

### Delete

Delete an existing controller.

**Parameters**

- *alias* - An alias of the controller you want to delete. 

**Returns** undefined.

```js
Typed.controllers.delete ('alias');
```

*[Back to Table of Contents](#table-of-contents)*

### Get

Get an existing controllers data structure.

**Parameters**

- *alias* - An alias of the controller you want to get. 

**Returns** null if not found, or an object with the following format:

- *alias* - The primary alias name.

- *aliases* - An array of all aliases.

- *controller* - The primary controller function.

- *controllers* - An array of all controllers (including dependency controllers) that make up the controller.

- *errorFunctions* - An array of all error functions (including dependency error functions).

- *dependencies* - Aliases for all dependencies for this controller. 

- *normalizeFunctions* - An array of all normalize functions (including dependency error functions).

```js
const data = Typed.controllers.get ('alias');
```

*[Back to Table of Contents](#table-of-contents)*

### Has

Check to see if a controller has been defined with the specified alias.

**Parameters**

- *alias* - An alias of the controller you check for. 

**Returns** `true` if registered, `false` if not registered.

```js
Typed.controllers.has ('alias');
```

*[Back to Table of Contents](#table-of-contents)*

### Is

Check to see if two aliases are referencing the same controller.

**Parameters**

- *alias1* - The first alias.

- *alias2* - The second alias. 

**Returns** `true` if both aliases are for the same controller, otherwise `false`.

```js
Typed.controllers.is ('alias1', 'alias2');
```

*[Back to Table of Contents](#table-of-contents)*

### List

Get an array of all registered type controllers.

**Parameters** None

**Returns** an array of controller data objects.

```js
Typed.controllers.list ();
```

*[Back to Table of Contents](#table-of-contents)*