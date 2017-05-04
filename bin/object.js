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
    const allowNull = config.hasOwnProperty('allowNull') ? !!config.allowNull : true;
    const hasProperties = config.hasOwnProperty('properties');

    if (hasProperties && !util.isValidSchemaConfiguration(config.properties)) {
        const message = util.propertyErrorMessage('properties', config.properties, 'Must be a plain object.');
        throw Error(message);
    }

    if (config.hasOwnProperty('schema')) {
        if (!util.isValidSchemaConfiguration(config.schema)) {
            const message = util.propertyErrorMessage('schema', config.schema, 'Must be a plain object.');
            throw Error(message);
        }
        validateSchemaConfiguration('schema', config.schema);
    }

    const schemaIsNotOneOf = config.hasOwnProperty('schema') ? !FullyTyped.controllers.is('one-of', config.schema.type) : true;

    Object.defineProperties(object, {

        allowNull: {
            /**
             * @property
             * @name TypedObject#allowNull
             * @type {boolean}
             */
            value: allowNull,
            writable: false
        },

        clean: {
            /**
             * @property
             * @name TypedObject#clean
             * @type {boolean}
             */
            value: !!config.clean,
            writable: false
        },

        properties: {
            /**
             * @property
             * @name TypedObject#properties
             * @type {object}
             */
            value: hasProperties ? config.properties : {},
            writable: false
        },

        schema: {
            /**
             * @property
             * @name TypedObject#schema
             * @type {object, undefined}
             */
            value: config.schema ? FullyTyped(mergeSchemas(config.schema)) : undefined,
            writable: false
        }

    });

    // add typing to each property specified in the configuration
    Object.keys(object.properties)
        .forEach(function(key) {
            let options = object.properties[key] || {};
            const optionsIsNotOneOf = !FullyTyped.controllers.is('one-of', options.type);

            if (!util.isValidSchemaConfiguration(options)) {
                throw Error('Invalid configuration for property: ' + key + '. Must be a plain object.');
            }

            // merge generic schema with property specific schemas
            if (config.schema) {
                if (schemaIsNotOneOf && optionsIsNotOneOf) {
                    options = mergeSchemas(config.schema, options);
                } else if (schemaIsNotOneOf) {
                    options.oneOf = options.oneOf.map(item => mergeSchemas(config.schema, item));
                } else if (optionsIsNotOneOf) {
                    options.oneOf = config.schema.oneOf.map(item => mergeSchemas(item, options));
                    options.type = 'one-of';
                } else {
                    const array = [];
                    const optionsLength = options.oneOf.length;
                    const schemaLength = config.schema.oneOf.length;
                    for (let i = 0; i < optionsLength; i++) {
                        for (let j = 0; j < schemaLength; j++) {
                            array.push(mergeSchemas(config.schema.oneOf[j], options.oneOf[i]));
                        }
                    }
                    options.oneOf = array;
                    options.type = 'one-of';
                }
            } else if (optionsIsNotOneOf) {
                extend(options);
            } else {
                options.oneOf.forEach(item => extend(item));
            }

            // create a schema instance for each property
            const schema = FullyTyped(options);
            object.properties[key] = schema;

            // validate that not required and has default
            validateSchemaConfiguration(key, schema);
        });

    return object;
}

TypedObject.prototype.error = function(value, prefix) {

    if (typeof value !== 'object') {
        return prefix + util.valueErrorMessage(value, 'Expected an object.');
    }

    if (!value && !this.allowNull) {
        return prefix + 'Object cannot be null.';
    }

    // null allowed - no other tests make a difference
    if (!value) return null;

    const errors = [];
    const object = this;

    // check that all required properties exist
    Object.keys(object.properties)
        .forEach(function(key) {
            const schema = object.properties[key];
            if (schema.required && !value.hasOwnProperty(key)) {
                const err = 'Missing required value for property: ' + key;
                errors.push(err);
            }
        });

    // validate each property value
    Object.keys(value)
        .forEach(key => {
            const schema = object.properties.hasOwnProperty(key)
                ? object.properties[key]
                : object.schema;
            if (!schema) return;

            // run inherited error check on property
            const err = schema.error(value[key]);
            if (err) errors.push(err);
        });

    if (errors.length > 0) {
        const count = errors.length === 1 ? 'One error with property' : 'Multiple errors with properties';
        return prefix + count + ' in the object:\n  ' + errors.join('\n  ');
    }

    return null;
};

TypedObject.prototype.normalize = function(value) {
    const result = {};
    const object = this;

    if (!value) return null;

    Object.keys(object.properties)
        .forEach(function(key) {
            const item = object.properties[key];
            if (item.hasDefault && !value.hasOwnProperty(key)) value[key] = item.default;
        });

    Object.keys(value)
        .forEach(function (key) {
            if (object.properties.hasOwnProperty(key)) {
                const schema = object.properties[key];
                result[key] = schema.normalize(value[key]);
            } else if (!object.clean) {
                result[key] = value[key];
            }
        });

    return result;
};

TypedObject.register = {
    aliases: ['object', Object],
    dependencies: []
};




function extend(obj) {
    if (!obj._extension_ || typeof obj._extension_ !== 'object') obj._extension_ = {};
    obj._extension_.required = !!obj.required;
}

function mergeSchemas(general, specific) {
    const merged = Object.assign({}, general, specific);
    extend(merged);
    return merged;
}

function validateSchemaConfiguration (key, schema) {

    // required
    if (schema.required && schema.hasDefault) {
        throw Error('Invalid configuration for property: ' + key + '. Cannot make required and provide a default value.');
    }
}