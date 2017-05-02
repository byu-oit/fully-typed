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

module.exports = TypedOneOf;

/**
 * Create a TypedOneOf instance.
 * @param {object} config
 * @returns {TypedOneOf}
 * @augments Typed
 * @constructor
 */
function TypedOneOf (config) {
    const oneOf = this;
    const Schema = this.Schema;

    // validate oneOf
    if (!config.hasOwnProperty('oneOf')) {
        const err = Error('Invalid configuration. Missing required one-of property: oneOf. Must be an array of schema configurations.');
        util.throwWithMeta(err, util.errors.config);
    }
    if (!Array.isArray(config.oneOf) || config.oneOf.filter(v => !v || typeof v !== 'object').length) {
        const err = Error('Invalid configuration value for property: oneOf. Must be an array of schema configurations.');
        util.throwWithMeta(err, util.errors.config);
    }

    // define properties
    Object.defineProperties(oneOf, {

        oneOf: {
            /**
             * @property
             * @name TypedOneOf#oneOf
             * @type {object}
             */
            value: config.oneOf.map(item => Schema(item)),
            writable: false
        }

    });

    return oneOf;
}

TypedOneOf.prototype.error = function(value, prefix) {
    const length = this.oneOf.length;
    const errors = [];
    for (let i = 0; i < length; i++) {
        const error = this.oneOf[i].error(value, prefix);
        if (!error) return null;
        errors.push(error);
    }

    return util.errish(prefix + 'All possible schemas have errors:\n  ' + errors.join('\n  '), TypedOneOf.errors.oneOf);
};

TypedOneOf.prototype.normalize = function(value) {
    const length = this.oneOf.length;
    for (let i = 0; i < length; i++) {
        const error = this.oneOf[i].error(value, '');
        if (!error) return this.oneOf[i].normalize(value);
    }
};

TypedOneOf.errors = {
    oneOf: {
        code: 'EONEO',
        explanation: 'None of the possible schemas matched the value.',
        summary: 'No matching schema found.'
    }
};