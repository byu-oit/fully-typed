# fully-typed

Run time type validation, transformation, and error generator that works out of the box on primitives, objects, arrays, and nested objects. Also extensible for custom types.

### Features

- Create schemas to validate values against.
- Build in support for arrays, booleans, functions, numbers, objects, strings, and symbols.
- Extensible - use plugins or create your own to integrate more types.
- Get detailed error messages when a wrong value is run against a schema.
- Auto throw errors when normalizing or validating.

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
positiveIntegerSchema.error(-1).message;   // Invalid number. Must be greater than or equal to 0. Received: -1
positiveIntegerSchema.error(1.2).message;  // Invalid number. Must be an integer. Received: 1.2
positiveIntegerSchema.error('1').message;  // Invalid value. Expected a number. Received: "1"

// throw errors
positiveIntegerSchema.validate(-1);        // throws error
positiveIntegerSchema.normalize(-1);       // validate will run prior to normalization - throws error
```

## Shared Configuration Options

All types defined in this library share the following common configuration options. Plugins may use these properties too if programmed to do so.

**Configuration Options**

- *default* - A value to use during [normalization](#) if the value is `undefined`. This is especially useful for [object configurations](#).

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

- *transform* - (Function) This function is only run during [normalization](#). It receives the validated value and must return a value. The value returned will be the result of [normalization](#).

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

## Array

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

## Boolean

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

## Function

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

## Number

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
        max: 1
    });

    schema.error(-1);       // no errors
    schema.error(1);        // no errors
    schema.error(2);        // error
    ```

## Object

An object type will require the input to be an object. You can also specify which properties are required and the schema expected for individual properties.

Type Aliases: `'object'`, `Object`

In addition to the [shared configuration options](#shared-configuration-options) it also has these options:

- *allowNull* - (Boolean) Whether `null` is an acceptable value. Defaults to `false`.

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

- *properties* - (Object) Define the properties that can be part of this object. Each property takes a full schema configuration. Each property is also given a `required` property that can be set to true.

    ```js

    ```

    TODO: make sure object is normalizing
    TODO: add erase unknown properties option

## One-Of

## String

## Symbol