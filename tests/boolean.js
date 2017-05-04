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
const expect            = require('chai').expect;
const Schema            = require('../index');

describe('TypedBoolean', () => {

    describe('strict', () => {

        it('defaults to false', () => {
            const b = Schema({ type: Boolean });
            expect(b.strict).to.be.false;
        });

        it('is converted to a boolean', () => {
            const b = Schema({ type: Boolean, strict: 'hello' });
            expect(b.strict).to.be.true;
        });

    });

    describe('#error', () => {

        it('strict requires boolean', () => {
            const b = Schema({ type: Boolean, strict: true });
            expect(b.error(123)).to.match(/Expected a boolean/);
        });

        it('not strict does not require boolean', () => {
            const b = Schema({ type: Boolean, strict: false });
            expect(b.error(123)).to.be.null;
        });

    });

    describe('#normalize', () => {

        it('converts falsy to false', () => {
            const b = Schema({ type: Boolean });
            expect(b.normalize(0)).to.be.false;
        });

        it('converts truthy to true', () => {
            const b = Schema({ type: Boolean });
            expect(b.normalize(1)).to.be.true;
        });

    });

});