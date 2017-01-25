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
const controllers       = require('../bin/controllers');
const expect            = require('chai').expect;

describe('controllers', () => {
    function noop() {}
    let ctrl;

    beforeEach(() => {
        ctrl = controllers();
    });

    it('can define', () => {
        expect(ctrl.get('foo')).to.be.null;
        ctrl.define(['foo'], noop);
        expect(ctrl.get('foo')).not.to.be.null;
    });

    it('inherit cannot be string', () => {
        expect(() => ctrl.define(['foo'], noop, 'bar')).to.throw(Error);
    });

    it('inherit cannot use non-existing', () => {
        expect(() => ctrl.define(['foo'], noop, ['bar'])).to.throw(Error);
    });

    it('inherit can be array of string', () => {
        ctrl.define(['foo'], noop);
        ctrl.define(['bar'], noop, ['foo']);
    });

    it('can have multiple names', () => {
        const o = {};
        ctrl.define(['foo', 'bar', o], noop);
        expect(ctrl.get('foo')).not.to.be.null;
        expect(ctrl.get('bar')).not.to.be.null;
        expect(ctrl.get(o)).not.to.be.null;
    });

    it('can get list of controllers', () => {
        ctrl.define(['foo'], noop);
        ctrl.define(['bar', 'baz'], noop, ['foo']);
        const items = ctrl.list();
        expect(items.length).to.equal(2);
    });

});