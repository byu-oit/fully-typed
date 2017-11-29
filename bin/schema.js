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
const crypto            = require('crypto');
const FullyTyped        = require('./fully-typed');
const util              = require('./util');

const instances = new WeakMap();

module.exports = Schema;

/**
 * Create a schema instance.
 * @param {Object} config The configuration for the schema.
 * @param {ControllerData} data
 * @constructor
 */
function Schema(config, data) {
    const controllers = data.controllers;
    const length = controllers.length;

    this.FullyTyped = FullyTyped;

    // apply controllers to this schema
    for (let i = 0; i < length; i++) controllers[i].call(this, config);

    // add additional properties
    if (config._extension_ && typeof config._extension_ === 'object') {
        const self = this;
        Object.keys(config._extension_).forEach(function(key) {
            self[key] = config._extension_[key];
        });
    }

    // store protected data with schema
    const protect = Object.assign({}, data);

    // create and store hash
    const options = getNormalizedSchemaConfiguration(this);
    protect.hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(prepareForHash(options)))
        .digest('hex');
    instances.set(this, protect);

    /**
     * @name Schema#config
     * @type {object}
     */
    Object.defineProperty(this, 'config', {
        get: function() {
            return util.copy(config);
        }
    });
}

/**
 * Check if a value produces any errors.
 * @name Schema#error
 * @param {*} value
 * @param {string} [prefix='']
 * @returns {string,null}
 */
Schema.prototype.error = function(value, prefix) {
    validateContext(this);
    const errorFunctions = instances.get(this).errorFunctions;
    if (!prefix) prefix = '';
    const length = errorFunctions.length;
    for (let i = 0; i < length; i++) {
        const err = errorFunctions[i].call(this, value, prefix);
        if (err) return err;
    }
    return null;
};

/**
 * Get the configuration hash.
 * @name Schema#hash
 * @returns {string}
 */
Schema.prototype.hash = function() {
    validateContext(this);
    return instances.get(this).hash;
};

/**
 * Validate then normalize a value.
 * @name Schema#normalize
 * @param {*} value
 * @returns {*}
 */
Schema.prototype.normalize = function(value) {
    validateContext(this);
    const normalizeFunctions = instances.get(this).normalizeFunctions;
    if (typeof value === 'undefined' && this.hasDefault) value = this.default;
    this.validate(value, '');
    const length = normalizeFunctions.length;
    for (let i = 0; i < length; i++) {
        value = normalizeFunctions[i].call(this, value);
    }
    return value;
};

/**
 * Validate a value against the schema and throw an error if encountered.
 * @name Schema#validate
 * @param {*} value
 * @param {string} [prefix='']
 */
Schema.prototype.validate = function(value, prefix) {
    validateContext(this);
    const str = this.error(value, prefix);
    if (str) throw Error(str);
};



function getNormalizedSchemaConfiguration(obj) {
    return Object.getOwnPropertyNames(obj)
        .reduce((prev, key) => {
            prev[key] = obj[key];
            return prev;
        }, {});
}

function prepareForHash(value) {
    if (Array.isArray(value)) {
        return value.map(prepareForHash);
    } else if (value && typeof value === 'object') {
        const result = {};
        const keys = Object.keys(value);
        keys.sort();
        keys.forEach(function(key) {
            result[key] = prepareForHash(value[key]);
        });
        return result;
    } else {
        switch (typeof value) {
            case 'function':
            case 'symbol':
                return value.toString();
            default:
                return value;
        }
    }
}

function validateContext(context) {
    if (!instances.has(context)) throw Error('Invalid context for prototype method.');
}