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
const Typed             = require('../bin/typed');

describe('Typed', () => {

    it('does not require any options', () => {
        expect(() => Schema()).not.to.throw(Error);
    });

    it('accepts empty object', () => {
        expect(() => Schema({})).not.to.throw(Error);
    });

    it('accepts null', () => {
        expect(() => Schema({})).not.to.throw(Error);
    });

    it('does not accept string', () => {
        expect(() => Schema('string')).to.throw(Error);
    });

    it('exposes config', () => {
        const config = { type: 'typed' };
        const schema = Schema(config);
        expect(schema.config).not.to.equal(config);
        expect(schema.config).to.deep.equal(config);
    });

    describe('enum', () => {

        it('cannot be a string', () => {
            expect(() => Schema({ enum: 'hello' })).to.throw(/Expected a non-empty array/);
        });

        it('cannot be an empty array', () => {
            expect(() => Schema({ enum: [] })).to.throw(/Expected a non-empty array/);
        });

        it('can be an array', () => {
            expect(() => Schema({ enum: ['abc'] })).to.not.throw(Error);
        });

        it('removes duplicates', () => {
            const item = Schema({ enum: ['a', 'b', 'c', 'b', 'b', 'a', 'd'] });
            expect(item.enum).to.deep.equal(['a', 'b', 'c', 'd']);
        });

    });

    describe('transform', () => {

        it('can be a function', () => {
            Schema({ transform: () => {} });
        });

        it('can not be a string', () => {
            expect(() => Schema({ transform: 'hello' })).to.throw(/Expected a function/);
        });

    });

    describe('type', () => {

        it('must be a registered constructor', () => {
            expect(() => Schema({ type: () => {} })).to.throw(/Unknown type/);
        });

        it('can be a string matching typeof possibilities', () => {
            Schema({ type: 'number' });
        });

        it('can be an object matching typeof possibilities', () => {
            Schema({ type: Number });
        });

        it('cannot be an arbitrary string', () => {
            expect(() => Schema({ type: 'abc' })).to.throw(/Unknown type/);
        });

    });

    describe('validate', () => {

        it('can be a function', () => {
            new Typed({ validator: () => {} });
        });

        it('cannot be a string', () => {
            expect(() => new Typed({ validator: 'abc' })).to.throw(/Expected a function/);
        });

    });

    describe('#error', () => {

        describe('no config means no errors', () => {

            it('object', () => {
                const item = Schema();
                expect(item.error({ x: true })).to.deep.equal(null);
            });

            it('number', () => {
                const item = Schema();
                expect(item.error(5)).to.deep.equal(null);
            });

            it('undefined', () => {
                const item = Schema();
                expect(item.error(undefined)).to.deep.equal(null);
            });

        });

        it('invalid context', () => {
            const item = Schema({});
            expect(() => item.error.call(null, 'abc')).to.throw(/Invalid context/);
        });

        it('checks enum', () => {
            const item = Schema({ enum: ['abc'] });
            expect(item.error('def')).to.match(/Expected one of/);
        });
        
        it('checks type', () => {
            const item = Schema({ type: Number });
            expect(item.error(true)).to.match(/Expected a number/);
        });

        it('runs validator', () => {
            const item = Schema({ validator: v => false });
            expect(item.error('')).to.match(/Validator did not pass/);
        });

        it('runs validator with custom message', () => {
            const item = Schema({ validator: v => 'fail' });
            expect(/fail/.test(item.error(''))).to.equal(true);
        });

    });

    describe('#normalize', () => {

        it('will not use default if not undefined', () => {
            const item = Schema({ default: 'abc' });
            const value = item.normalize('xyz');
            expect(value).to.equal('xyz');
        });

        it('will use default if undefined', () => {
            const item = Schema({ default: 'abc' });
            const value = item.normalize();
            expect(value).to.equal('abc');
        });

        it('will use transform', () => {
            const item = Schema({ transform: v => v.toUpperCase() });
            const value = item.normalize('abc');
            expect(value).to.equal('ABC');
        });

    });

    describe('#validate', () => {

        it('no error', () => {
            const item = Schema({ validator: v => true });
            expect(() => item.validate('')).to.not.throw(Error);
        });

        it('validate error', () => {
            const item = Schema({ validator: v => false });
            expect(() => item.validate('')).to.throw(/Validator did not pass/);
        });

    });

});