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
const Typed             = require('../bin/typed');
const TypedArray        = require('../bin/array');
const util              = require('../bin/util');

describe('TypedArray', () => {

    describe('minItems', () => {

        it('cannot be a negative number', () => {
            const e = util.extractError(() => Schema({ type: Array, minItems: -1 }));
            expect(e.code).to.equal(Typed.errors.config.code);
        });

        it('can be zero', () => {
            expect(() => Schema({ type: 'array', minItems: 0 })).to.not.throw(Error);
        });

        it('can be positive', () => {
            expect(() => Schema({ type: Array, minItems: 1 })).to.not.throw(Error);
        });

    });

    describe('maxItems', () => {

        it('cannot be a negative number', () => {
            const e = util.extractError(() => Schema({ type: 'array', maxItems: -1 }));
            expect(e.code).to.equal(Typed.errors.config.code);
        });

        it('can be zero', () => {
            expect(() => Schema({ type: 'array', maxItems: 0 })).to.not.throw(Error);
        });

        it('can be positive', () => {
            expect(() => Schema({ type: 'array', maxItems: 1 })).to.not.throw(Error);
        });

        it('cannot be less than minItems', () => {
            const e = util.extractError(() => Schema({ type: 'array', minItems: 1, maxItems: 0 }));
            expect(e.code).to.equal(Typed.errors.config.code);
        });

        it('can be same as minItems', () => {
            expect(() => Schema({ type: 'array', minItems: 1, maxItems: 1 })).to.not.throw(Error);
        });

        it('can be greater than minItems', () => {
            expect(() => Schema({ type: 'array', minItems: 1, maxItems: 3 })).to.not.throw(Error);
        });

    });

    describe('#error', () => {

        it('checks type', () => {
            const ar = Schema({ type: Array });
            expect(ar.error('hello').code).to.equal(Typed.errors.type.code);
        });

        it('checks max', () => {
            const ar = Schema({ type: Array, maxItems: 1 });
            expect(ar.error([1, 2]).code).to.equal(TypedArray.errors.max.code);
        });

        it('checks min', () => {
            const ar = Schema({ type: Array, minItems: 1 });
            expect(ar.error([]).code).to.equal(TypedArray.errors.min.code);
        });

        it('checks unique', () => {
            const ar = Schema({ type: Array, uniqueItems: true });
            expect(ar.error([1, 2, 3])).to.equal(null);
            expect(ar.error([1, 2, 1]).code).to.equal(TypedArray.errors.unique.code);
        });

        describe('Schema', () => {
            let ar;

            before(() => {
                ar = Schema({ type: Array, schema: { type: Number } })
            });

            it('no errors', () => {
                expect(ar.error([1, 2, 3])).to.equal(null);
            });

            it('invalid at index 1', () => {
                const error = ar.error([1, '2', 3]);
                expect(error.code).to.equal(TypedArray.errors.items.code);
                expect(error.errors.length).to.equal(1);
                expect(error.errors[0].index).to.equal(1);
            });

            it('invalid at index 1 and 2', () => {
                const error = ar.error([1, '2', true]);
                expect(error.code).to.equal(TypedArray.errors.items.code);
                expect(error.errors.length).to.equal(2);
                expect(error.errors[0].index).to.equal(1);
                expect(error.errors[1].index).to.equal(2);
            });

        });

    });

    describe('#normalize', () => {
        let schema;
        let value;

        before(() => {
            // accepts number but rounds numbers greater than or equal to 10.1
            schema = Schema({
                type: Array,
                schema: [
                    {
                        type: Number,
                        min: 10.1,
                        transform: v => Math.round(v)
                    },
                    {
                        type: Number,
                        max: 10.1,
                        exclusiveMax: true
                    }
                ]
            });
            value = schema.normalize([ 7.5, 10.1, 15.5 ]);
        });

        it('7.5 => 7.5', () => {
            expect(value[0]).to.equal(7.5);
        });

        it('10.1 => 10', () => {
            expect(value[1]).to.equal(10);
        });

        it('15.5 => 16', () => {
            expect(value[2]).to.equal(16);
        });

    });

});