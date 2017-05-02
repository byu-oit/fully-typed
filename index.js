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
const Schema            = require('./bin/schema');
const controllers       = Schema.controllers;

module.exports = Schema;

Schema.OneOf = Symbol('one-of');

controllers.define(['typed'],                   require('./bin/typed'));
controllers.define(['array', Array],            require('./bin/array'),     ['typed']);
controllers.define(['boolean', Boolean],        require('./bin/boolean'),   ['typed']);
controllers.define(['function', Function],      require('./bin/function'),  ['typed']);
controllers.define(['number', Number],          require('./bin/number'),    ['typed']);
controllers.define(['object', Object],          require('./bin/object'),    ['typed']);
controllers.define(['one-of', Schema.OneOf],    require('./bin/one-of'),    ['typed']);
controllers.define(['string', String],          require('./bin/string'),    ['typed']);
controllers.define(['symbol', Symbol],          require('./bin/symbol'),    ['typed']);