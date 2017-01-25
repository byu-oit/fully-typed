/**
 *  @license
 *    Copyright 2016 Brigham Young University
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
        const err = Error(message);
        util.throwWithMeta(err, util.errors.config);
    }
    const min = config.hasOwnProperty('minArguments') ? config.minArguments : 0;

    if (config.hasOwnProperty('maxArguments') && (!util.isInteger(config.maxArguments) || config.maxArguments < min)) {
        const message = util.propertyErrorMessage('minArguments', config.maxArguments, 'Expected a integer greater than minArgument value of ' + min + '.');
        const err = Error(message);
        util.throwWithMeta(err, util.errors.config);
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
        const expected = 'Expected a ' + (this.named ? 'named ' : '') + ' function.';
        const err = typeof value !== 'function' ? util.errors.type : TypedFunction.errors.named;
        return util.errish(prefix + util.valueErrorMessage(value, expected), err);
    }

    if (typeof this.minArguments !== 'undefined' && value.length < this.minArguments) {
        const expected = 'Expected the function to have at least ' + this.minArguments + ' parameter' + (this.minArguments !== 1 ? 's' : '') + '.';
        return util.errish(prefix + util.valueErrorMessage(value, expected), TypedFunction.errors.minArguments);
    }

    if (typeof this.maxArguments !== 'undefined' && value.length > this.maxArguments) {
        const expected = 'Expected the function to have at most ' + this.maxArguments + ' parameters.';
        return util.errish(prefix + util.valueErrorMessage(value, expected), TypedFunction.errors.maxArguments);
    }

    return null;
};

TypedFunction.errors = {
    maxArguments: {
        code: 'EFMAX',
        explanation: 'The function signature specifies more arguments then the allowable max.',
        summary: 'The function defines too many parameters.'
    },
    minArguments: {
        code: 'EFMIN',
        explanation: 'The function signature specifies less arguments then the allowable min.',
        summary: 'The function defines too few parameters.'
    },
    named: {
        code: 'EFNAM',
        explanation: 'The function must be named.',
        summary: 'The function must be named.'
    },
};