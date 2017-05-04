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
const TypedFunction     = require('../bin/function');

describe('TypedFunction', () => {

    describe('maxArguments', () => {

        it('cannot be less than min', () => {
            expect(() => Schema({ type: Function, maxArguments: 0, minArguments: 1 })).to.throw(/Expected a integer greater than minArgument/);
        });

        it('must be an integer', () => {
            expect(() => Schema({ type: Function, maxArguments: 0.5 })).to.throw(/Expected a integer greater than minArgument/);
        });

        it('must be a number', () => {
            expect(() => Schema({ type: Function, maxArguments: '' })).to.throw(/Expected a integer greater than minArgument/);
        });

    });

    describe('minArguments', () => {

        it('cannot be less than 0', () => {
            expect(() => Schema({ type: Function, minArguments: -1 })).to.throw(/Expected a non-negative integer/);
        });

        it('must be an integer', () => {
            expect(() => Schema({ type: Function, minArguments: 0.5 })).to.throw(/Expected a non-negative integer/);
        });

        it('must be a number', () => {
            expect(() => Schema({ type: Function, minArguments: '' })).to.throw(/Expected a non-negative integer/);
        });

    });

    describe('#error', () => {

        it('can  be errorless', () => {
            const f = Schema({ type: Function });
            expect(f.error(() => {})).to.be.null;
        });

        it('checks type', () => {
            const f = Schema({ type: Function });
            expect(f.error('')).to.match(/Expected a function/);
        });

        it('named function', () => {
            const f = Schema({ type: Function, named: true });
            expect(f.error(() => {})).to.match(/Expected a named function/);
        });

        it('min arguments 1', () => {
            const f = Schema({ type: 'function', minArguments: 1 });
            expect(f.error(() => {})).to.match(/Expected the function to have at least/);
        });

        it('min arguments 2', () => {
            const f = Schema({ type: 'function', minArguments: 2 });
            expect(f.error(() => {})).to.match(/Expected the function to have at least/);
        });

        it('max arguments 1', () => {
            const f = Schema({ type: 'function', maxArguments: 0 });
            expect(f.error((a) => {})).to.match(/Expected the function to have at most/);
        });

        it('max arguments 2', () => {
            const f = Schema({ type: 'function', maxArguments: 1 });
            expect(f.error((a, b) => {})).to.match(/Expected the function to have at most/);
        });

    });

});