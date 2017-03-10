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

const Typed = require('../index');

const positiveIntegerSchema = Typed({
    type: Number,
    default: 100,
    min: 0,
    integer: true
});

console.log(positiveIntegerSchema.normalize(undefined));     // value === 100

console.log(positiveIntegerSchema.error(0));         // null - no error
console.log(positiveIntegerSchema.error(1));         // null - no error

console.log(positiveIntegerSchema.error(-1));

console.log(positiveIntegerSchema.error(-1).message);   // Invalid number. Must be greater than or equal to 0. Received: -1
console.log(positiveIntegerSchema.error(1.2).message);  // Invalid number. Must be an integer. Received: 1.2
console.log(positiveIntegerSchema.error('1').message);  // Invalid value. Expected a number. Received: "1"

try {
    positiveIntegerSchema.normalize(-1);
} catch (e) {
    console.log(e.message);
}

try {
    positiveIntegerSchema.validate(-1);
} catch (e) {
    console.log(e.message);
}

