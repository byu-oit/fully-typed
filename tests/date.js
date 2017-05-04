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

describe('TypedNumber', () => {

    describe('max', () => {

        it('can be a number', () => {
            expect(() => Schema({ type: Date, max: 0 })).to.not.throw(Error);
        });

        it('can be a date string', () => {
            expect(() => Schema({ type: Date, max: '2000-01-01' })).to.not.throw(Error);
        });

        it('can be a Date', () => {
            expect(() => Schema({ type: Date, max: new Date('2000-01-01') })).to.not.throw(Error);
        });

        it('cannot be an invalid date string', () => {
            expect(() => Schema({ type: Date, max: 'abc' })).to.throw(/max could not be converted/);
        });

    });

    describe('min', () => {

        it('can be a number', () => {
            expect(() => Schema({ type: Date, min: 0 })).to.not.throw(Error);
        });

        it('can be a date string', () => {
            expect(() => Schema({ type: Date, min: '2000-01-01' })).to.not.throw(Error);
        });

        it('can be a Date', () => {
            expect(() => Schema({ type: Date, min: new Date('2000-01-01') })).to.not.throw(Error);
        });

        it('cannot be an invalid date string', () => {
            expect(() => Schema({ type: Date, min: 'abc' })).to.throw(/min could not be converted/);
        });

        it('cannot be greater than max', () => {
            expect(() => Schema({ type: Date, max: '2000-01-01', min: '2020-01-01' })).to.throw(/max date value must be greater than/);
        });

    });

    describe('#error', () => {

        it('no errors', () => {
            const date = Schema({ type: Date });
            expect(date.error(1)).to.be.null;
        });

        it('checks type', () => {
            const date = Schema({ type: Date });
            expect(date.error('hello')).to.match(/Value cannot be converted/);
        });

        it('checks max', () => {
            const date = Schema({ type: Date, max: '2000-01-01' });
            expect(date.error('2010-01-01')).to.match(/must be less than/);
        });

        it('checks min', () => {
            const date = Schema({ type: Date, min: '2000-01-01' });
            expect(date.error('1990-01-01')).to.match(/must be greater than/);
        });

    });

    describe('#normalize', () => {

        it('Date', () => {
            const d = new Date();
            const date = Schema({ type: Date }).normalize(d);
            expect(d).to.equal(date);
        });

        it('date string', () => {
            const d = new Date();
            const date = Schema({ type: Date }).normalize(d.toISOString());
            expect(+d).to.equal(+date);
        });

        it('number', () => {
            const d = new Date(0);
            const date = Schema({ type: Date }).normalize(0);
            expect(+d).to.equal(+date);
        });

    });

});