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

module.exports = TypedBoolean;

/**
 * Create a TypedBoolean instance.
 * @param {object} config
 * @returns {TypedBoolean}
 * @augments Typed
 * @constructor
 */
function TypedBoolean (config) {
    const boolean = this;

    // define properties
    Object.defineProperties(boolean, {

        strict: {
            /**
             * @property
             * @name TypedBoolean#strict
             * @type {boolean}
             */
            value: config.hasOwnProperty('strict') ? !!config.strict : false,
            writable: false
        }

    });

    return boolean;
}

TypedBoolean.prototype.error = function (value, prefix) {

    if (this.strict && typeof value !== 'boolean') {
        return prefix + util.valueErrorMessage(value, 'Expected a boolean.');
    }

    return null;
};

TypedBoolean.prototype.normalize = function (value) {
    return !!value;
};

TypedBoolean.register = {
    aliases: ['boolean', Boolean],
    dependencies: []
};