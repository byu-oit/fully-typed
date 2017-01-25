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
const expect            = require('chai').expect;
const Schema            = require('../index');
const TypedNumber       = require('../bin/number');
const util              = require('../bin/util');

describe('TypedNumber', () => {

    describe('max', () => {

        it('can be a number', () => {
            expect(() => Schema({ type: Number, max: 0 })).to.not.throw(Error);
        });

        it('cannot be a string', () => {
            const e = util.extractError(() => Schema({ type: Number, max: 'abc' }));
            expect(e.code).to.equal(util.errors.config.code);
        });

    });

    describe('min', () => {

        it('can be a number', () => {
            expect(() => Schema({ type: Number, min: 0 })).to.not.throw(Error);
        });

        it('cannot be a string', () => {
            const e = util.extractError(() => Schema({ type: Number, min: 'abc' }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('can be less than max', () => {
            expect(() => Schema({ type: Number, min: 0, max: 1 })).to.not.throw(Error);
        });

        it('cannot be greater than max', () => {
            const e = util.extractError(() => Schema({ type: Number, min: 1, max: 0 }));
            expect(e.code).to.equal(util.errors.config.code);
        });

    });

    describe('#error', () => {

        it('no errors', () => {
            const ar = Schema({ type: Number });
            expect(ar.error(1)).to.be.null;
        });

        it('checks type', () => {
            const ar = Schema({ type: Number });
            expect(ar.error('hello').code).to.equal(util.errors.type.code);
        });

        it('checks integer', () => {
            const ar = Schema({ type: Number, integer: true });
            expect(ar.error(2.1).code).to.equal(TypedNumber.errors.integer.code);
        });

        it('checks max', () => {
            const ar = Schema({ type: Number, max: 1 });
            expect(ar.error(2).code).to.equal(TypedNumber.errors.max.code);
        });

        it('checks min', () => {
            const ar = Schema({ type: Number, min: 1 });
            expect(ar.error(0).code).to.equal(TypedNumber.errors.min.code);
        });

        it('checks exclusive max', () => {
            const ar = Schema({ type: Number, exclusiveMax: true, max: 0 });
            expect(ar.error(0).code).to.equal(TypedNumber.errors.max.code);
        });

        it('checks exclusive min', () => {
            const ar = Schema({ type: Number, exclusiveMin: true, min: 0 });
            expect(ar.error(0).code).to.equal(TypedNumber.errors.min.code);
        });

    });

});