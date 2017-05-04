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
const vowels = ['a', 'e', 'i', 'o', 'u'];

exports.aOrAn = function(word) {
    const ch1 = word.substr(0, 1).toLowerCase();
    return (vowels.indexOf(ch1) === -1 ? 'a' : 'an') + ' ' + word;
};

exports.copy = function(value) {
    if (Array.isArray(value)) {
        return value.map(function(v) {
            return exports.copy(v);
        });
    } else if (exports.isPlainObject(value)) {
        const result = {};
        Object.keys(value)
            .forEach(function(k) {
                result[k] = exports.copy(value[k]);
            });
        return result;
    } else {
        return value;
    }
};

exports.errors = {
    config: {
        code: 'ETCFG',
        explanation: 'The provided configuration has one or more errors.',
        summary: 'Error with configuration.'
    },
    type: {
        code: 'ETTYP',
        explanation: 'The type of the value does not match that specified by the configuration.',
        summary: 'Invalid type.'
    },
    multi: {
        code: 'ETMUL',
        explanation: 'Multiple schemas tested the value for errors and none passed.',
        summary: 'Invalid value.'
    }
};

exports.isInteger = function (value) {
    return exports.isNumber(value) && value === Math.round(value);
};

exports.isNumber = function (value) {
    return typeof value === 'number' && !isNaN(value);
};

exports.isPlainObject = function (value) {
    return value &&
            typeof value === 'object' &&
            value.constructor === Object &&
            Object.getPrototypeOf(value) === Object.prototype;
};

exports.isValidSchemaConfiguration = function(value) {
    return exports.isPlainObject(value);
};

exports.propertyErrorMessage = function (property, actual, expected) {
    return 'Invalid configuration value for property: ' + property + '. ' + expected + ' Received: ' + quoteWrap(actual);
};

exports.valueErrorMessage = function(actual, expected) {
    const value = actual instanceof Object && actual.constructor && actual.constructor.name
        ? exports.aOrAn(actual.constructor.name)
        : actual;
    return 'Invalid value. ' + expected + ' Received: ' + quoteWrap(value);
};



function quoteWrap(value) {
    return typeof value === 'string' ? '"' + value + '"' : value;
}