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

const schema = Typed({
    type: Object,
    properties: {
        name: {
            required: true,
            type: String,
            minLength: 1
        },
        age: {
            type: Number,
            min: 0
        },
        employed: {
            type: Boolean,
            default: true
        }
    }
});

function addPerson(configuration) {
    const config = schema.normalize(configuration); // throws an error if the input is invalid
    console.log(config);
    // ... do more stuff
}

addPerson({ name: 'Bob', age: 15 });