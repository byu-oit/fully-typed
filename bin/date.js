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

module.exports = TypedDate;

function TypedDate (config) {
    const max = toDate(config.max);
    const min = toDate(config.min);

    if (config.hasOwnProperty('max') && !max) {
        throw Error('Property max could not be converted to a valid date. Received: ' + config.max);
    }

    if (config.hasOwnProperty('min') && !min) {
        throw Error('Property min could not be converted to a valid date. Received: ' + config.min);
    }

    if (max !== undefined && min !== undefined && min > max) {
        throw Error('The max date value must be greater than or equal to the min date value.');
    }

    Object.defineProperties(this, {
        max: {
            value: max
        },
        min: {
            value: min
        }
    });
}

TypedDate.prototype.error = function(value, prefix) {
    const d = toDate(value);

    if (!d) return prefix + 'Value cannot be converted to a valid date: ' + value;

    if (this.max && d > this.max) return prefix + 'Value must be less than or equal to the max date value.';

    if (this.min && d < this.min) return prefix + 'Value must be greater than or equal to the min date value.';

    return null;
};

TypedDate.prototype.normalize = function(value) {
    return toDate(value);
};

TypedDate.register = {
    aliases: ['date', Date],
    dependencies: []
};

function toDate(value) {
    const d = value instanceof Date
        ? value
        : new Date(value);
    return isNaN(+d) ? undefined : d;
}