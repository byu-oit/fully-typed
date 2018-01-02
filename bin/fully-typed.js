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
const Schema            = require('./schema');
const util              = require('./util');

module.exports = FullyTyped;

/**
 * Get a copy of the configuration used to generate the FullyTyped instance.
 * @type {object}
 * @name FullyTyped#config
 */

/**
 * Check a value against the schema for errors.
 * @function
 * @name FullyTyped#error
 * @param {*} value The value to test.
 * @param {string} [prefix=''] The prefix to add at the start of any errors.
 * @returns {string|null}
 */

/**
 * Get the hash that represents this fully typed configuration.
 * @function
 * @name FullyTyped#hash
 * @param {*} value The value to test.
 * @param {string} [prefix=''] The prefix to add at the start of any errors.
 * @returns {string}
 */

/**
 * Normalize a value against the configuration.
 * @function
 * @name FullyTyped#normalize
 * @param {*} value The value to normalize.
 * @returns {*}
 */

/**
 * Validate a value against the schema and throw an error if encountered.
 * @function
 * @name FullyTyped#validate
 * @param {*} value
 * @param {string} [prefix='']
 * @throws {Error}
 */


/**
 * Get a typed schema.
 * @constructor
 * @param {object, object[]} [configuration={}]
 * @returns {FullyTyped}
 */
function FullyTyped (configuration) {
    if (arguments.length === 0 || configuration === null) configuration = {};

    // validate input parameter
    if (!util.isPlainObject(configuration)) {
        throw Error('If provided, the schema configuration must be a plain object. Received: ' + configuration);
    }

    // get a copy of the configuration
    const config = util.copy(configuration);

    // if type is not specified then use the default
    if (!config.type) config.type = 'typed';

    // get the controller data
    const data = FullyTyped.controllers.get(config.type);

    // type is invalid
    if (!data) throw Error('Unknown type: ' + config.type);

    // return a schema object
    return new Schema(config, data);
}

/**
 * @static
 * @name FullyTyped.controllers
 * @type {Controllers}
 */
FullyTyped.controllers = require('./controllers')();

FullyTyped.OneOf = Symbol('one-of');
FullyTyped.Typed = Symbol('typed');