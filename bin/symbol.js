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

module.exports = TypedSymbol;

/**
 * Create a TypedSymbol instance.
 * @param {object} config
 * @returns {TypedSymbol}
 * @augments Typed
 * @constructor
 */
function TypedSymbol (config) {
    const symbol = this;

    return symbol;
}

TypedSymbol.prototype.error = function (value, prefix) {

    if (typeof value !== 'symbol') {
        return prefix + util.valueErrorMessage(value, 'Expected a symbol.');
    }

    return null;
};

TypedSymbol.register = {
    aliases: ['symbol', Symbol],
    dependencies: []
};