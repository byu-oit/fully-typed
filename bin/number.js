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

module.exports = TypedNumber;

/**
 * Create a TypedNumber instance.
 * @param {object} config
 * @returns {TypedNumber}
 * @augments Typed
 * @constructor
 */
function TypedNumber (config) {
    const number = this;

    // validate min
    if (config.hasOwnProperty('min') && !util.isNumber(config.min)) {
        const message = util.propertyErrorMessage('min', config.min, 'Must be a number.');
        throw Error(message);
    }

    // validate max
    if (config.hasOwnProperty('max') && !util.isNumber(config.max)) {
        const message = util.propertyErrorMessage('max', config.max, 'Must be a number.');
        throw Error(message);
    }

    // validate max is greater than min
    if (config.hasOwnProperty('max') && config.hasOwnProperty('min') && config.min > config.max) {
        const message = util.propertyErrorMessage('max', config.max, 'Must be a number that is less than the minimum: ' + config.min + '.');
        throw Error(message);
    }

    // define properties
    Object.defineProperties(number, {

        exclusiveMax: {
            /**
             * @property
             * @name TypedNumber#exclusiveMax
             * @type {boolean}
             */
            value: !!config.exclusiveMax,
            writable: false
        },

        exclusiveMin: {
            /**
             * @property
             * @name TypedNumber#exclusiveMin
             * @type {boolean}
             */
            value: !!config.exclusiveMin,
            writable: false
        },

        integer: {
            /**
             * @property
             * @name TypedNumber#integer
             * @type {boolean}
             */
            value: !!config.integer,
            writable: false
        },

        max: {
            /**
             * @property
             * @name TypedNumber#max
             * @type {number}
             */
            value: Number(config.max),
            writable: false
        },

        min: {
            /**
             * @property
             * @name TypedNumber#min
             * @type {number}
             */
            value: Number(config.min),
            writable: false
        }

    });

    return number;
}

TypedNumber.prototype.error = function (value, prefix) {

    if (typeof value !== 'number') {
        return prefix + util.valueErrorMessage(value, 'Expected a number.');
    }

    if (this.integer && !Number.isInteger(value)) {
        return prefix + 'Invalid number. Must be an integer. Received: ' + value;
    }

    if (typeof this.max !== 'undefined' && (value > this.max || (this.exclusiveMax && value === this.max))) {
        const extra = this.exclusiveMax ? '' : 'or equal to ';
        return prefix + 'Invalid number. Must be less than ' + extra + this.max + '. Received: ' + value;
    }

    if (typeof this.min !== 'undefined' && (value < this.min || (this.exclusiveMin && value === this.min))) {
        const extra = this.exclusiveMin ? '' : 'or equal to ';
        return prefix + 'Invalid number. Must be greater than ' + extra + this.min + '. Received: ' + value;
    }

    return null;
};

TypedNumber.register = {
    aliases: ['number', Number],
    dependencies: []
};