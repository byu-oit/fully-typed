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
const Typed             = require('../bin/typed');
const TypedString       = require('../bin/string');
const util              = require('../bin/util');

describe('TypedString', () => {

    describe('minLength', () => {

        it('cannot be a negative number', () => {
            const e = util.extractError(() => new TypedString({ minLength: -1 }));
            expect(e.code).to.equal(Typed.errors.config.code);
        });

        it('can be zero', () => {
            expect(() => new TypedString({ minLength: 0 })).to.not.throw(Error);
        });

        it('can be positive', () => {
            expect(() => new TypedString({ minLength: 1 })).to.not.throw(Error);
        });

    });

    describe('maxLength', () => {

        it('cannot be a negative number', () => {
            const e = util.extractError(() => new TypedString({ maxLength: -1 }));
            expect(e.code).to.equal(Typed.errors.config.code);
        });

        it('can be zero', () => {
            expect(() => new TypedString({ maxLength: 0 })).to.not.throw(Error);
        });

        it('can be positive', () => {
            expect(() => new TypedString({ maxLength: 1 })).to.not.throw(Error);
        });

        it('cannot be less than minLength', () => {
            const e = util.extractError(() => new TypedString({ minLength: 1, maxLength: 0 }));
            expect(e.code).to.equal(Typed.errors.config.code);
        });

        it('can be same as minLength', () => {
            expect(() => new TypedString({ minLength: 1, maxLength: 1 })).to.not.throw(Error);
        });

        it('can be greater than minLength', () => {
            expect(() => new TypedString({ minLength: 1, maxLength: 3 })).to.not.throw(Error);
        });

    });

    describe('pattern', () => {

        it('can be regular expression', () => {
            expect(() => new TypedString({ pattern: /abc/ })).to.not.throw(Error);
        });

        it('cannot be a string', () => {
            const e = util.extractError(() => new TypedString({ pattern: 'abc' }));
            expect(e.code).to.equal(Typed.errors.config.code);
        });

    });

    describe('#error', () => {

        it('no error', () => {
            const str = new TypedString({});
            expect(str.error('b')).to.equal(null);
        });

        it('checks type', () => {
            const str = new TypedString({});
            expect(str.error(123).code).to.equal(Typed.errors.type.code);
        });

        it('checks max', () => {
            const str = new TypedString({ maxLength: 1 });
            expect(str.error('abc').code).to.equal(TypedString.errors.max.code);
        });

        it('checks min', () => {
            const str = new TypedString({ minLength: 1 });
            expect(str.error('').code).to.equal(TypedString.errors.min.code);
        });

        it('checks pattern', () => {
            const str = new TypedString({ pattern: /^a$/ });
            expect(str.error('b').code).to.equal(TypedString.errors.pattern.code);
        });

    });

});