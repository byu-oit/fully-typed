/**
 *  @license
 *    Copyright 2017 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict';
const util              = require('./util');

module.exports = Typed;

/**
 * Create a Typed instance.
 * @param {object} config
 * @returns {Typed}
 * @constructor
 */
function Typed (config) {
    const typed = this;
    const hasDefault = config.hasOwnProperty('default');

    // enum
    if (config.hasOwnProperty('enum')) {
        if (!Array.isArray(config.enum) || config.enum.length === 0) {
            const err = Error(util.propertyErrorMessage('enum', config.enum, 'Expected a non-empty array'));
            util.throwWithMeta(err, Typed.errors.config);
        }
        const copy = [];
        config.enum.forEach(function(v) {
            if (copy.indexOf(v) === -1) copy.push(v);
        });
        config.enum = copy;
    }

    // transform
    if (config.transform && typeof config.transform !== 'function') {
        const err = Error(util.propertyErrorMessage('transform', config.transform, 'Expected a function'));
        util.throwWithMeta(err, Typed.errors.config);
    }

    // validate
    if (config.validator && typeof config.validator !== 'function') {
        const err = Error(util.propertyErrorMessage('validator', config.validator, 'Expected a function'));
        util.throwWithMeta(err, Typed.errors.config);
    }

    // define properties
    Object.defineProperties(typed, {

        default: {
            /**
             * @property
             * @name Typed#default
             * @type {function,*}
             */
            value: config.default,
            writable: false
        },

        enum: {
            /**
             * @property
             * @name Typed#enum
             * @readonly
             * @type {function,*}
             */
            value: config.enum,
            writable: false
        },

        hasDefault: {
            /**
             * @property
             * @name Typed#hasDefault
             * @type {boolean}
             */
            value: hasDefault,
            writable: false
        },

        transform: {
            /**
             * @property
             * @name Typed#transform
             * @readonly
             * @type {function}
             */
            value: config.transform,
            writable: false
        },

        type: {
            /**
             * @property
             * @name Typed#type
             * @readonly
             * @type {string,function}
             */
            value: config.type,
            writable: false
        },

        validator: {
            /**
             * @property
             * @name Typed#validator
             * @readonly
             * @type {function}
             */
            value: config.validator,
            writable: false
        }
    });

    return typed;
}

/**
 * Get details about any errors associated with the value provided.
 * @param {*} value The value to check for errors.
 * @param {string} [prefix=''] A string to add to the beginning of any errors.
 * @returns {object} If an error then it's a plain object that has similar properties to the error, otherwise null.
 */
Typed.prototype.error = function(value, prefix) {
    if (!prefix) prefix = '';

    // validate the enum
    if (this.enum && this.enum.indexOf(value) === -1) {
        const expects = '. Expected one of: [' + this.enum.join(', ') + ']';
        return util.errish(prefix + util.valueErrorMessage(value, expects), Typed.errors.enum);
    }

    // run validate function
    if (this.validator) {
        const valid = this.validator(value);
        const message = !valid || typeof valid === 'string'
            ? prefix + util.valueErrorMessage(value, !valid ? this.help : valid)
            : '';
        if (message) return util.errish(message, Typed.errors.validate);
    }

    return null;
};

/**
 * Validate a value and normalize it. Normalization takes the value through any transformations after validation.
 * @param {*} value
 */
Typed.prototype.normalize = function(value) {
    if (this.hasDefault && typeof value === 'undefined') value = this.default;
    return this.transform ? this.transform(value) : value;
};

/**
 * This will be overwritten when defined as a schema.
 * @type {Object<string, Function>}
 */
Typed.prototype.Schema = {};

/**
 * If a value is not valid then throw an error.
 * @param {*} value A value to test.
 * @param {string} [prefix=''] A string to add to the beginning of any errors.
 * @throws {Error}
 */
Typed.prototype.validate = function(value, prefix) {};

Typed.errors = {
    config: util.errors.config,
    enum: {
        code: 'ETENM',
        explanation: 'The value does not match any of the specified enum values.',
        summary: 'Value not in enum.'
    },
    type: util.errors.type,
    validate: {
        code: 'ETVLD',
        explanation: 'The value was run through the validate function supplied in the configuration and did not pass.',
        summary: 'Did not pass validation.'
    }
};