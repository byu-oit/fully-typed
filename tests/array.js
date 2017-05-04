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
const TypedArray        = require('../bin/array');

describe('TypedArray', () => {

    describe('minItems', () => {

        it('cannot be a negative number', () => {
            expect(() => Schema({ type: Array, minItems: -1 })).to.throw(/Invalid configuration value for property: minItems/);
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
            expect(() => Schema({ type: 'array', maxItems: -1 })).to.throw(/Invalid configuration value for property: maxItems/);
        });

        it('can be zero', () => {
            expect(() => Schema({ type: 'array', maxItems: 0 })).to.not.throw(Error);
        });

        it('can be positive', () => {
            expect(() => Schema({ type: 'array', maxItems: 1 })).to.not.throw(Error);
        });

        it('cannot be less than minItems', () => {
            expect(() => Schema({ type: 'array', minItems: 1, maxItems: 0 })).to.throw(/Invalid configuration value for property: maxItems/);
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
            expect(ar.error('hello')).to.match(/Expected an array/);
        });

        it('checks max', () => {
            const ar = Schema({ type: Array, maxItems: 1 });
            expect(ar.error([1, 2])).to.match(/Must contain at most/);
        });

        it('checks min', () => {
            const ar = Schema({ type: Array, minItems: 1 });
            expect(ar.error([])).to.match(/Must contain at least/);
        });

        it('checks unique', () => {
            const ar = Schema({ type: Array, uniqueItems: true });
            expect(ar.error([1, 2, 3])).to.equal(null);
            expect(ar.error([1, 2, 1])).to.match(/All items must be unique/);
            expect(ar.error([1, 2, 1, 1])).to.match(/All items must be unique/);
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
                expect(error).to.match(/One error/);
            });

            it('invalid at index 1 and 2', () => {
                const error = ar.error([1, '2', true]);
                expect(error).to.match(/Multiple errors/);
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
                schema: {
                    type: 'one-of',
                    oneOf: [
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
                }
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