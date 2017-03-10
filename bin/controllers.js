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
const util              = require('./util');

module.exports = Controllers;

/**
 *
 * @returns {Controllers}
 * @constructor
 */
function Controllers() {
    const factory = Object.create(Controllers.prototype);
    const store = new Map();
    const dependencies = new Map();
    const instances = new WeakMap();

    /**
     * Define a controller that manages schemas.
     * @name Controllers#define
     * @param {Array} aliases
     * @param {Function} controller
     * @param {string[]} [inherits=[]]
     */
    factory.define = function(aliases, controller, inherits) {

        // validate input
        if (!Array.isArray(aliases)) aliases = [aliases];
        aliases.forEach(alias => {
            if (store.has(alias)) throw Error('The specified alias is already in use: ' + alias);
        });
        if (typeof controller !== 'function') throw Error('Controller must be a function: Received: ' + controller);
        if (arguments.length < 3) inherits = [];
        if (!Array.isArray(inherits)) throw Error('Controller inherits must be an array.');
        inherits.forEach(inherit => {
            if (!store.has(inherit)) throw Error('Cannot inherit from undefined controller: ' + inherit);
        });

        const ctrls = [];
        const errorFunctions = [];
        const normalizeFunctions = [];
        const firstStringAlias = aliases.filter(a => typeof a === 'string')[0];

        // verify that inherits exist already and build inheritance arrays
        inherits.forEach(function(inherit) {
            const ctrl = store.get(inherit).controller;
            const proto = ctrl.prototype;

            ctrls.push(ctrl);
            if (proto.hasOwnProperty('error')) errorFunctions.push(proto.error);
            if (proto.hasOwnProperty('normalize')) normalizeFunctions.push(proto.normalize);
        });
        ctrls.push(controller);
        if (controller.prototype.hasOwnProperty('error')) errorFunctions.push(controller.prototype.error);
        if (controller.prototype.hasOwnProperty('normalize')) normalizeFunctions.push(controller.prototype.normalize);

        /**
         * Create a schema instance.
         * @param {object} config The configuration for the schema.
         * @param {object} schema The schema controller.
         * @constructor
         */
        function Schema(config, schema) {
            const length = ctrls.length;
            const extended = config.hasOwnProperty('__') ? config.__ : {};
            this.Schema = schema;

            // apply controllers to this schema
            for (let i = 0; i < length; i++) ctrls[i].call(this, config);

            // add additional properties
            if (util.isPlainObject(extended.properties)) Object.defineProperties(this, extended.properties);

            // create a hash
            const protect = {};
            const options = getNormalizedSchemaConfiguration(this);
            protect.hash = crypto
                .createHash('sha256')
                .update(Object.keys(options)
                    .map(key => {
                        const value = options[key];
                        if (typeof value === 'function') return value.toString();
                        if (typeof value === 'object') return JSON.stringify(value);
                        return value;
                    })
                    .join('')
                )
                .digest('hex');

            // store the protected data
            instances.set(this, protect);
        }

        Schema.prototype.error = function(value, prefix) {
            if (!prefix) prefix = '';
            const length = errorFunctions.length;
            for (let i = 0; i < length; i++) {
                const err = errorFunctions[i].call(this, value, prefix);
                if (err) return err;
            }
            return null;
        };

        Schema.prototype.hash = function() {
            return instances.has(this) ? instances.get(this).hash : ''
        };

        Schema.prototype.normalize = function(value) {
            if (typeof value === 'undefined' && this.hasDefault) value = this.default;
            this.validate(value);
            const length = normalizeFunctions.length;
            for (let i = 0; i < length; i++) {
                value = normalizeFunctions[i].call(this, value);
            }
            return value;
        };

        Schema.prototype.toJSON = function() {
            const options = getNormalizedSchemaConfiguration(this);
            if (typeof options.type === 'function') options.type = options.type.name || firstStringAlias || 'anonymous';
            return options;
        };

        Schema.prototype.validate = function(value, prefix) {
            const o = this.error(value, prefix);
            if (o) {
                const err = Error(o.message);
                util.throwWithMeta(err, o);
            }
        };

        // store data
        const data = {
            aliases: aliases,
            controller: controller,
            inherits: inherits,
            Schema: Schema
        };
        aliases.forEach(alias => store.set(alias, data));
        inherits.forEach(inherit => {
            const key = store.get(inherit);
            const items = dependencies.get(key) || [];
            items.push(data);
            if (!dependencies.has(key)) dependencies.set(key, items);
        });
    };

    /**
     * Delete a registered schema controller. If it cannot be deleted due to this being a dependency for other controllers
     * then an error will be throw with a property "dependencies" that lists those controllers that are dependent on
     * this controller.
     * @param {*} alias
     */
    factory.delete = function(alias) {
        if (store.has(alias)) {
            const data = store.get(alias);
            const items = dependencies.get(data);
            if (items && items.length > 0) {
                const err = Error('Cannot delete controller definition due to dependencies on this definition.');
                err.dependencies = items.map(v => {
                    return {
                        aliases: v.aliases.slice(0),
                        controller: v.controller,
                        inherits: v.inherits.slice(0),
                        Schema: v.Schema
                    };
                });
                throw err;
            }

            data.aliases.forEach(alias => store.delete(alias));
            data.inherits.forEach(inherit => {
                const key = store.get(inherit);
                const items = dependencies.get(key);
                if (items) {
                    const index = items.indexOf(data);
                    if (index !== -1) items.splice(index, 1);
                    if (items.length === 0) dependencies.delete(key);
                }
            });
        }
    };

    /**
     * @name Controllers#get
     * @param {*} alias
     * @returns {null|{aliases: Array, controller: Function, inherits: Array, Schema: Function}}
     */
    factory.get = function(alias) {
        if (!store.has(alias)) return null;
        const item = store.get(alias);
        return {
            aliases: item.aliases.slice(0),
            controller: item.controller,
            inherits: item.inherits.slice(0),
            Schema: item.Schema
        };
    };

    /**
     * @name Controllers#has
     * @param {*} alias
     * @returns {boolean}
     */
    factory.has = function(alias) {
        return store.has(alias);
    };

    /**
     * @name Controllers#list
     * @returns {{constructor: Function, controller: Function, inherits: string[], name: string}[]}
     */
    factory.list = function() {
        const used = new Map();
        const iterator = store.entries();
        const result = [];
        do {
            const item = iterator.next();
            if (item.done) break;
            const key = item.value[0];
            const data = item.value[1];
            if (!used.has(data)) {
                used.set(data, true);
                result.push(factory.get(key));
            }
        } while (true);
        return result;
    };

    return factory;
}

function getNormalizedSchemaConfiguration(obj) {
    return Object.getOwnPropertyNames(obj)
        .filter(k => k !== 'Schema')
        .reduce((prev, key) => {
            prev[key] = obj[key];
            return prev;
        }, {});
}