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
const TypedString       = require('../bin/string');

describe('TypedString', () => {

    describe('minLength', () => {

        it('cannot be a negative number', () => {
            expect(() => new TypedString({ minLength: -1 })).to.throw(/integer that is greater than/);
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
            expect(() => new TypedString({ maxLength: -1 })).to.throw(/integer that is greater than/);
        });

        it('can be zero', () => {
            expect(() => new TypedString({ maxLength: 0 })).to.not.throw(Error);
        });

        it('can be positive', () => {
            expect(() => new TypedString({ maxLength: 1 })).to.not.throw(Error);
        });

        it('cannot be less than minLength', () => {
            expect(() => new TypedString({ minLength: 1, maxLength: 0 })).to.throw(/integer that is greater than/);
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
            expect(() => new TypedString({ pattern: 'abc' })).to.throw(/Must be a regular expression object/);
        });

    });

    describe('#error', () => {

        it('no error', () => {
            const str = new TypedString({});
            expect(str.error('b')).to.equal(null);
        });

        it('checks type', () => {
            const str = new TypedString({});
            expect(str.error(123)).to.match(/Expected a string/);
        });

        it('checks max', () => {
            const str = new TypedString({ maxLength: 1 });
            expect(str.error('abc')).to.match(/Must contain at most/);
        });

        it('checks min', () => {
            const str = new TypedString({ minLength: 1 });
            expect(str.error('')).to.match(/Must contain at least/);
        });

        it('checks pattern', () => {
            const str = new TypedString({ pattern: /^a$/ });
            expect(str.error('b')).to.match(/Does not match required pattern/);
        });

    });

});