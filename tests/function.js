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
const TypedFunction     = require('../bin/function');
const util              = require('../bin/util');

describe('TypedFunction', () => {

    describe('maxArguments', () => {

        it('cannot be less than min', () => {
            const e = util.extractError(() => Schema({ type: Function, maxArguments: 0, minArguments: 1 }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('must be an integer', () => {
            const e = util.extractError(() => Schema({ type: Function, maxArguments: 0.5 }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('must be a number', () => {
            const e = util.extractError(() => Schema({ type: Function, maxArguments: '' }));
            expect(e.code).to.equal(util.errors.config.code);
        });

    });

    describe('minArguments', () => {

        it('cannot be less than 0', () => {
            const e = util.extractError(() => Schema({ type: Function, minArguments: -1 }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('must be an integer', () => {
            const e = util.extractError(() => Schema({ type: Function, minArguments: 0.5 }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('must be a number', () => {
            const e = util.extractError(() => Schema({ type: Function, minArguments: '' }));
            expect(e.code).to.equal(util.errors.config.code);
        });

    });

    describe('#error', () => {

        it('can  be errorless', () => {
            const f = Schema({ type: Function });
            expect(f.error(() => {})).to.be.null;
        });

        it('checks type', () => {
            const f = Schema({ type: Function });
            expect(f.error('').code).to.equal(util.errors.type.code);
        });

        it('named function', () => {
            const f = Schema({ type: Function, named: true });
            expect(f.error(() => {}).code).to.equal(TypedFunction.errors.named.code);
        });

        it('min arguments', () => {
            const f = Schema({ type: 'function', minArguments: 1 });
            expect(f.error(() => {}).code).to.equal(TypedFunction.errors.minArguments.code);
        });

        it('max arguments', () => {
            const f = Schema({ type: 'function', maxArguments: 0 });
            expect(f.error((a) => {}).code).to.equal(TypedFunction.errors.maxArguments.code);
        });

    });

});