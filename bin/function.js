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

module.exports = TypedFunction;

/**
 * Create a TypedFunction instance.
 * @param {object} config
 * @returns {TypedFunction}
 * @augments Typed
 * @constructor
 */
function TypedFunction (config) {
    const fn = this;

    if (config.hasOwnProperty('minArguments') && (!util.isInteger(config.minArguments) || config.minArguments < 0)) {
        const message = util.propertyErrorMessage('minArguments', config.minArguments, 'Expected a non-negative integer.');
        throw Error(message);
    }
    const min = config.hasOwnProperty('minArguments') ? config.minArguments : 0;

    if (config.hasOwnProperty('maxArguments') && (!util.isInteger(config.maxArguments) || config.maxArguments < min)) {
        const message = util.propertyErrorMessage('minArguments', config.maxArguments, 'Expected a integer greater than minArgument value of ' + min + '.');
        throw Error(message);
    }

    // define properties
    Object.defineProperties(fn, {

        maxArguments: {
            /**
             * @property
             * @name TypedString#maxArguments
             * @type {number}
             */
            value: config.maxArguments,
            writable: false
        },

        minArguments: {
            /**
             * @property
             * @name TypedString#minArguments
             * @type {number}
             */
            value: min,
            writable: false
        },

        named: {
            /**
             * @property
             * @name TypedString#strict
             * @type {boolean}
             */
            value: config.hasOwnProperty('named') ? !!config.named : false,
            writable: false
        }

    });

    return fn;
}

TypedFunction.prototype.error = function (value, prefix) {

    if (typeof value !== 'function' || (this.named && !value.name)) {
        const expected = 'Expected a ' + (this.named ? 'named ' : '') + 'function.';
        return prefix + util.valueErrorMessage(value, expected);
    }

    if (typeof this.minArguments !== 'undefined' && value.length < this.minArguments) {
        const expected = 'Expected the function to have at least ' + this.minArguments + ' parameter' + (this.minArguments !== 1 ? 's' : '') + '.';
        return prefix + util.valueErrorMessage(value, expected);
    }

    if (typeof this.maxArguments !== 'undefined' && value.length > this.maxArguments) {
        const expected = 'Expected the function to have at most ' + this.maxArguments + ' parameter' + (this.maxArguments !== 1 ? 's' : '') + '.';
        return prefix + util.valueErrorMessage(value, expected);
    }

    return null;
};

TypedFunction.register = {
    aliases: ['function', Function],
    dependencies: []
};