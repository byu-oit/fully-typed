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

module.exports = TypedObject;

/**
 * Create a TypedObject instance.
 * @param {object} config
 * @returns {TypedObject}
 * @augments Typed
 * @constructor
 */
function TypedObject (config) {
    const object = this;
    const Schema = this.Schema;
    const allowNull = config.hasOwnProperty('allowNull') ? !!config.allowNull : false;
    const hasProperties = config.hasOwnProperty('properties');

    if (hasProperties && !util.isPlainObject(config.properties)) {
        const message = util.propertyErrorMessage('properties', config.properties, 'Must be a plain object.');
        const err = Error(message);
        util.throwWithMeta(err, util.errors.config);
    }

    Object.defineProperties(object, {

        allowNull: {
            /**
             * @property
             * @name TypedObject#allowNull
             * @type {function,*}
             */
            value: allowNull,
            writable: false
        },

        properties: {
            /**
             * @property
             * @name TypedObject#properties
             * @type {function,*}
             */
            value: hasProperties ? config.properties : {},
            writable: false
        }

    });

    // add typing to each property specified in the configuration
    Object.keys(object.properties)
        .forEach(function(key) {
            const value = object.properties[key] || {};

            if (!util.isPlainObject(value)) {
                const err = Error('Invalid configuration for property: ' + key + '. Must be a plain object.');
                util.throwWithMeta(err, util.errors.config);
            }

            const schema = Schema(value);
            object.properties[key] = schema;

            // required
            if (value.required && schema.hasDefault) {
                const err = Error('Invalid configuration for property: ' + key + '. Cannot make required and provide a default value.');
                util.throwWithMeta(err, util.errors.config);
            }

            // add properties to the schema
            Object.defineProperties(schema, {

                required: {
                    /**
                     * @property
                     * @name Typed#required
                     * @type {boolean}
                     */
                    value: value ? !!value.required : false,
                    writable: false
                }

            });
        });

    return object;
}

TypedObject.prototype.error = function(value, prefix) {

    if (typeof value !== 'object') {
        return util.errish(prefix + util.valueErrorMessage(value, 'Expected an object.'), util.errors.type);
    }

    if (!value && !this.allowNull) {
        return util.errish(prefix + 'Object cannot be null.', TypedObject.errors.null);
    }

    const errors = [];
    const object = this;
    Object.keys(object.properties)
        .forEach(function(key) {
            const schema = object.properties[key];

            // if required then check that it exists on the value
            if (schema.required && !value.hasOwnProperty(key)) {
                const err = util.errish('Missing required value for property: ' + key, TypedObject.errors.required);
                err.property = key;
                errors.push(err);
                return;
            }

            // run inherited error check if it exists on the value
            if (value.hasOwnProperty(key)) {
                const err = schema.error(value[key]);
                if (err) {
                    err.property = key;
                    errors.push(err);
                }
            }
        });

    if (errors.length > 0) {
        const count = errors.length === 1 ? 'One error with property' : 'Multiple errors with properties';
        const err = util.errish(prefix + count + ' in the object:\n  ' +
            errors.map(function(e) { return e.toString() }).join('\n  '), TypedObject.errors.properties);
        err.errors = errors;
        return err;
    }

    return null;
};

TypedObject.errors = {
    null: {
        code: 'EONUL',
        explanation: 'The object cannot be null.',
        summary: 'The object cannot be null.'
    },
    properties: {
        code: 'EOPRP',
        explanation: 'One or more properties in the object have errors.',
        summary: 'One or more errors in properties.'
    },
    required: {
        code: 'EOREQ',
        explanation: 'A required property has not been assigned a value.',
        summary: 'Missing required property value.'
    }
};