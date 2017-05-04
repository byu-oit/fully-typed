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
        throw Error(message);
    }
    const minLength = config.hasOwnProperty('minLength') ? config.minLength : 0;

    // validate max length
    if (config.hasOwnProperty('maxLength') && (!util.isInteger(config.maxLength) || config.maxLength < minLength)) {
        const message = util.propertyErrorMessage('maxLength', config.maxLength, 'Must be an integer that is greater than or equal to the minLength.');
        throw Error(message);
    }

    // validate pattern
    if (config.hasOwnProperty('pattern') && !(config.pattern instanceof RegExp)) {
        const message = util.propertyErrorMessage('pattern', config.pattern, 'Must be a regular expression object.');
        throw Error(message);
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
        return prefix + util.valueErrorMessage(value, 'Expected a string.');
    }

    if (typeof this.minLength !== 'undefined' && value.length < this.minLength) {
        return prefix + 'Invalid string length. Must contain at least ' +
            this.minLength + ' characters. Contains ' + value.length;
    }

    if (typeof this.maxLength !== 'undefined' && value.length > this.maxLength) {
        return prefix + 'Invalid string length. Must contain at most '
            + this.maxLength + ' items. Contains ' + value.length;
    }

    if (this.pattern && !this.pattern.test(value)) {
        return prefix + 'Invalid string. Does not match required pattern ' +
            this.pattern.toString() + ' with value: ' + value;
    }

    return null;
};

TypedString.register = {
    aliases: ['string', String],
    dependencies: []
};