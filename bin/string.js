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
const util                  = require('./util');

module.exports = TypedString;

/**
 * Create a TypedString instance.
 * @param {object} config
 * @returns {TypedString}
 * @augments Typed
 * @constructor
 */
function TypedString (config) {
    const string = this;

    // validate min length
    if (config.hasOwnProperty('minLength') && (!util.isInteger(config.minLength) || config.minLength < 0)) {
        const message = util.propertyErrorMessage('minLength', config.minLength, 'Must be an integer that is greater than or equal to zero.');
        const err = Error(message);
        util.throwWithMeta(err, util.errors.config);
    }
    const minLength = config.hasOwnProperty('minLength') ? config.minLength : 0;

    // validate max length
    if (config.hasOwnProperty('maxLength') && (!util.isInteger(config.maxLength) || config.maxLength < minLength)) {
        const message = util.propertyErrorMessage('maxLength', config.maxLength, 'Must be an integer that is greater than or equal to the minLength.');
        const err = Error(message);
        util.throwWithMeta(err, util.errors.config);
    }

    // validate pattern
    if (config.hasOwnProperty('pattern') && !(config.pattern instanceof RegExp)) {
        const message = util.propertyErrorMessage('pattern', config.pattern, 'Must be a regular expression object.');
        const err = Error(message);
        util.throwWithMeta(err, util.errors.config);
    }

    // define properties
    Object.defineProperties(string, {

        maxLength: {
            /**
             * @property
             * @name TypedString#maxLength
             * @type {number}
             */
            value: Math.round(config.maxLength),
            writable: false
        },

        minLength: {
            /**
             * @property
             * @name TypedString#minLength
             * @type {number}
             */
            value: Math.round(config.minLength),
            writable: false
        },

        pattern: {
            /**
             * @property
             * @name TypedString#pattern
             * @type {RegExp}
             */
            value: config.pattern,
            writable: false
        }

    });

    return string;
}

TypedString.prototype.error = function (value, prefix) {

    if (typeof value !== 'string') {
        return util.errish(prefix + util.valueErrorMessage(value, 'Expected a string.'), util.errors.type);
    }

    if (typeof this.minLength !== 'undefined' && value.length < this.minLength) {
        return util.errish(prefix + 'Invalid string length. Must contain at least ' +
            this.minLength + ' characters. Contains ' + value.length, TypedString.errors.min);
    }

    if (typeof this.maxLength !== 'undefined' && value.length > this.maxLength) {
        return util.errish(prefix + 'Invalid string length. Must contain at most '
            + this.maxLength + ' items. Contains ' + value.length, TypedString.errors.max);
    }

    if (this.pattern && !this.pattern.test(value)) {
        return util.errish(prefix + 'Invalid string. Does not match required pattern ' +
            this.pattern.toString() + ' with value: ' + value, TypedString.errors.pattern);
    }

    return null;
};

TypedString.errors = {
    max: {
        code: 'ESMAX',
        explanation: 'The string has too many characters to meet the max length requirement.',
        summary: 'String too long.'
    },
    min: {
        code: 'ESMIN',
        explanation: 'The string has too few characters to meet the min length requirement.',
        summary: 'String too short.'
    },
    pattern: {
        code: 'ESPAT',
        explanation: 'The string does not match the regular expression pattern.',
        summary: 'String does not match pattern.'
    }
};