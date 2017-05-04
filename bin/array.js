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
const FullyTyped            = require('./fully-typed');
const util                  = require('./util');

module.exports = TypedArray;

/**
 * Create a TypedArray instance.
 * @param {object} config
 * @returns {TypedArray}
 * @augments Typed
 * @constructor
 */
function TypedArray (config) {
    const array = this;

    // validate min items
    if (config.hasOwnProperty('minItems') && (!util.isInteger(config.minItems) || config.minItems < 0)) {
        throw Error('Invalid configuration value for property: minItems. Must be an integer that is greater than or equal to zero. Received: ' + config.minItems);
    }
    const minItems = config.hasOwnProperty('minItems') ? config.minItems : 0;

    // validate max items
    if (config.hasOwnProperty('maxItems') && (!util.isInteger(config.maxItems) || config.maxItems < minItems)) {
        throw Error('Invalid configuration value for property: maxItems. Must be an integer that is greater than or equal to the minItems. Received: ' + config.maxItems);
    }

    // validate schema
    if (config.hasOwnProperty('schema')) config.schema = FullyTyped(config.schema);

    // define properties
    Object.defineProperties(array, {

        maxItems: {
            /**
             * @property
             * @name TypedArray#maxItems
             * @type {number}
             */
            value: Math.round(config.maxItems),
            writable: false
        },

        minItems: {
            /**
             * @property
             * @name TypedArray#minItems
             * @type {number}
             */
            value: Math.round(config.minItems),
            writable: false
        },

        schema: {
            /**
             * @property
             * @name TypedArray#schema
             * @type {object}
             */
            value: config.schema,
            writable: false
        },

        uniqueItems: {
            /**
             * @property
             * @name TypedArray#uniqueItems
             * @type {boolean}
             */
            value: !!config.uniqueItems,
            writable: false
        }

    });

    return array;
}

TypedArray.prototype.error = function(value, prefix) {

    if (!Array.isArray(value)) {
        return prefix + util.valueErrorMessage(value, 'Expected an array.');
    }

    if (typeof this.maxItems !== 'undefined' && value.length > this.maxItems) {
        return prefix + 'Invalid array length. Must contain at most ' + this.maxItems + ' items. Contains ' + value.length;
    }

    if (typeof this.minItems !== 'undefined' && value.length < this.minItems) {
        return prefix + 'Invalid array length. Must contain at least ' + this.minItems + ' items. Contains ' + value.length;
    }

    if (this.uniqueItems) {
        const map = new Map();
        const duplicates = [];
        value.forEach(function(v, i) {
            if (!map.has(v)) {
                map.set(v, [i]);
            } else {
                const store = map.get(v);
                if (store.length === 1) duplicates.push(store);
                store.push(i);
            }
        });
        if (duplicates.length > 0) {
            return prefix + 'Invalid array. All items must be unique. Duplicates found at indexes: [ ' + duplicates.join('], [') + ' ]';
        }
    }

    if (this.schema) {
        const errors = [];
        const schema = this.schema;
        value.forEach(function(v, i) {
            const err = schema.error(v, 'At index ' + i + ': ');
            if (err) errors.push(err);
        });
        if (errors.length > 0) {
            const count = errors.length === 1 ? 'One error' : 'Multiple errors';
            return prefix + count + ' with items in the array:\n  ' + errors.join('\n  ');
        }
    }
    
    return null;
};

TypedArray.prototype.normalize = function(value) {
    const schema = this.schema;
    return value.map(v => schema.normalize(v));
};

TypedArray.register = {
    aliases: ['array', Array],
    dependencies: []
};