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
const crypto            = require('crypto');
const Typed             = require('./typed');
const util              = require('./util');

/**
 * A controller data store object.
 * @typedef {{ alias: string, aliases: *[], controller: Function, controllers: Function[], errorFunctions: Function[], dependencies: *[], normalizeFunctions: Function[] }} ControllerData
 */

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

    /**
     * Delete a registered schema controller. If it cannot be deleted due to this being a dependency for other controllers
     * then an error will be throw with a property "dependencies" that lists those controllers that are dependent on
     * this controller.
     * @param {*} alias
     */
    factory.delete = function(alias) {
        if (store.has(alias)) {
            const data = store.get(alias);
            if (data.controller === Typed) throw Error('Cannot delete core controller: Typed');

            const items = dependencies.get(data);
            if (items && items.length > 0) {
                const names = items.map(v => v.alias);
                const err = Error('Cannot delete controller definition due to dependencies on this definition: ' + names.join(', '));
                err.dependencies = items;
                throw err;
            }

            data.aliases.forEach(alias => store.delete(alias));
            data.dependencies.forEach(dependency => {
                const key = store.get(dependency);
                const items = dependencies.get(key);
                const index = items.indexOf(data);
                items.splice(index, 1);
                if (items.length === 0) dependencies.delete(key);
            });
        }
    };

    /**
     * @name Controllers#get
     * @param {*} alias
     * @returns {null,ControllerData}
     */
    factory.get = function(alias) {
        return store.get(alias) || null;
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
     * Determine if two aliases are for the same controller.
     * @param {*} alias1
     * @param {*} alias2
     * @returns {boolean}
     */
    factory.is = function(alias1, alias2) {
        if (alias1 === alias2) return true;
        if (!store.has(alias1) || !store.has(alias2)) return false;
        const item1 = store.get(alias1);
        const item2 = store.get(alias2);
        return item1.controller === item2.controller;
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

    /**
     * Register a typed controller.
     * @name Controllers#register
     * @param {Function} controller
     */
    factory.register = function(controller) {

        // validate controller
        if (typeof controller !== 'function') throw Error('The controller to register must be a constructor function. Received: ' + controller);
        if (!controller.register || typeof controller.register !== 'object') throw Error('The controller must have a static property "register" that defines aliases and dependencies.');
        if (!Array.isArray(controller.register.aliases) || controller.register.aliases.length === 0) throw Error('The controller register aliases must be a non-empty array of aliases.');
        if (controller.register.hasOwnProperty('dependencies') && !Array.isArray(controller.register.dependencies)) throw Error('The controller register dependencies must be an array.');

        // store aliases and dependencies
        const aliases = controller.register.aliases;
        const inherits = controller.register.dependencies || [];

        // validate that aliases do not exist
        aliases.forEach(alias => {
            if (store.has(alias)) throw Error('The specified alias is already in use: ' + alias);
        });

        // validate that dependencies exist
        inherits.forEach(dependency => {
            if (!store.has(dependency)) throw Error('Controller dependency not defined: ' + dependency);
        });

        const controllers = [ Typed ];
        const errorFunctions = [ Typed.prototype.error ];
        const normalizeFunctions = [ Typed.prototype.normalize ];

        // build controllers and inheritance arrays
        inherits.forEach(function(dependency) {
            const ctrl = store.get(dependency).controller;
            const proto = ctrl.prototype;

            if (ctrl !== Typed) {
                controllers.push(ctrl);
                if (proto.hasOwnProperty('error')) errorFunctions.push(proto.error);
                if (proto.hasOwnProperty('normalize')) normalizeFunctions.push(proto.normalize);
            }
        });
        if (controller !== Typed) {
            controllers.push(controller);
            if (controller.prototype.hasOwnProperty('error')) errorFunctions.push(controller.prototype.error);
            if (controller.prototype.hasOwnProperty('normalize')) normalizeFunctions.push(controller.prototype.normalize);
        }

        // create data object to store
        const data = {
            alias: aliases
                .map(a => typeof a === 'function' ? a.name : a)
                .filter(a => typeof a === 'string' && a.length > 0)[0] || 'undefined',
            aliases: aliases,
            controller: controller,
            controllers: controllers,
            errorFunctions: errorFunctions,
            dependencies: inherits,
            normalizeFunctions: normalizeFunctions
        };
        Object.freeze(data.aliases);
        Object.freeze(data.controllers);
        Object.freeze(data.errorFunctions);
        Object.freeze(data.dependencies);
        Object.freeze(data.normalizeFunctions);

        // store data for each alias
        aliases.forEach(alias => store.set(alias, data));

        // link dependency to this controller
        inherits.forEach(inherit => {
            const key = store.get(inherit);
            const items = dependencies.get(key) || [];
            items.push(data);
            if (!dependencies.has(key)) dependencies.set(key, items);
        });

    };

    // register Typed
    factory.register(Typed);

    return factory;
}