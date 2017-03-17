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
    const allowNull = config.hasOwnProperty('allowNull') ? !!config.allowNull : true;
    const hasProperties = config.hasOwnProperty('properties');

    if (hasProperties && !util.isValidSchemaConfiguration(config.properties)) {
        const message = util.propertyErrorMessage('properties', config.properties, 'Must be a plain object or an array of plain objects.');
        const err = Error(message);
        util.throwWithMeta(err, util.errors.config);
    }

    if (config.hasOwnProperty('schema')) {
        if (!util.isValidSchemaConfiguration(config.schema)) {
            const message = util.propertyErrorMessage('schema', config.schema, 'Must be a plain object or an array of plain objects.');
            const err = Error(message);
            util.throwWithMeta(err, util.errors.config);
        }
        validateSchemaConfiguration('schema', config.schema);
    }

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
            value: config.schema ? Schema(mergeSchemas(config.schema)) : undefined,
            writable: false
        }

    });

    // add typing to each property specified in the configuration
    Object.keys(object.properties)
        .forEach(function(key) {
            let options = object.properties[key] || {};
            const optionsIsPlain = !Array.isArray(options);
            const schemaIsPlain = !Array.isArray(config.schema);

            if (!util.isValidSchemaConfiguration(options)) {
                const err = Error('Invalid configuration for property: ' + key + '. Must be a plain object.');
                util.throwWithMeta(err, util.errors.config);
            }

            // merge generic schema with property specific schemas
            if (config.schema) {
                if (schemaIsPlain && optionsIsPlain) {
                    options = mergeSchemas(config.schema, options);
                } else if (schemaIsPlain) {
                    options = options.map(item => mergeSchemas(config.schema, item));
                } else if (optionsIsPlain) {
                    options = config.schema.map(item => mergeSchemas(item, options));
                } else {
                    const array = [];
                    for (let i = 0; i < options.length; i++) {
                        for (let j = 0; j < config.schema.length; j++) {
                            array.push(mergeSchemas(config.schema[j], options[i]));
                        }
                    }
                    options = array;
                }
            } else if (optionsIsPlain) {
                options = mergeSchemas(options);
            } else {
                options = options.map(o => mergeSchemas(o));
            }

            // create a schema instance for each property
            const schema = Schema(options);
            object.properties[key] = schema;

            if (Array.isArray(options)) {
                schema.schemas.forEach((s, i) => validateSchemaConfiguration(key, s))
            } else {
                validateSchemaConfiguration(key, schema);
            }

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

    // check that all required properties exist
    Object.keys(object.properties)
        .forEach(function(key) {
            const schema = object.properties[key];
            if (schema.required && !value.hasOwnProperty(key)) {
                const err = util.errish('Missing required value for property: ' + key, TypedObject.errors.required);
                err.property = key;
                errors.push(err);
            }
        });

    // validate each property value
    if (value) {
        Object.keys(value)
            .forEach(key => {
                const schema = object.properties.hasOwnProperty(key)
                    ? object.properties[key]
                    : object.schema;
                if (!schema) return;

                // run inherited error check on property
                const err = schema.error(value[key]);
                if (err) {
                    err.property = key;
                    errors.push(err);
                }
            });
    }

    if (errors.length > 0) {
        const count = errors.length === 1 ? 'One error with property' : 'Multiple errors with properties';
        const err = util.errish(prefix + count + ' in the object:\n  ' +
            errors.map(function(e) { return e.toString() }).join('\n  '), TypedObject.errors.properties);
        err.errors = errors;
        return err;
    }

    return null;
};

TypedObject.prototype.normalize = function(value) {
    const result = {};
    const object = this;

    Object.keys(object.properties)
        .forEach(function(key) {
            const item = object.properties[key];
            if (item.hasDefault && !value.hasOwnProperty(key)) value[key] = item.default;
        });

    Object.keys(value)
        .forEach(function(key) {
            if (object.properties.hasOwnProperty(key)) {
                const schema = object.properties[key];
                result[key] = schema.normalize(value[key]);
            } else if (!object.clean) {
                result[key] = value[key];
            }
        });

    return result;
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




function mergeSchemas(general, specific) {
    const merged = Object.assign({}, general, specific || {});
    merged.__ = {
        properties: {
            required: {
                value: !!merged.required
            }
        }/*,
        error: function(value, prefix) {
            return;
        },
        normalize: function(value) {

        }*/
    };
    return merged;
}

function validateSchemaConfiguration (key, schema) {

    // required
    if (schema.required && schema.hasDefault) {
        const err = Error('Invalid configuration for property: ' + key + '. Cannot make required and provide a default value.');
        util.throwWithMeta(err, util.errors.config);
    }
}