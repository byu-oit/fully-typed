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
const controllers       = require('../bin/controllers');
const expect            = require('chai').expect;

describe.only('controllers', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = controllers();
    });

    it('can define', () => {
        const foo = makeController('foo', ['foo'], []);
        expect(ctrl.get('foo')).to.be.null;
        ctrl.register(foo);
        expect(ctrl.get('foo')).not.to.be.null;
    });

    it('can have multiple aliases', () => {
        const o = {};
        const foo = makeController('foo', ['foo', 'bar', o], []);
        ctrl.register(foo);
        expect(ctrl.get('foo')).not.to.be.null;
        expect(ctrl.get('bar')).not.to.be.null;
        expect(ctrl.get(o)).not.to.be.null;
    });

    it('can get list of controllers', () => {
        const foo = makeController('foo', ['foo'], []);
        const bar = makeController('bar', ['bar'], ['foo']);
        ctrl.register(foo);
        ctrl.register(bar);
        const items = ctrl.list();
        expect(items.length).to.equal(2);
    });

    it('has checks existence', () => {
        expect(ctrl.has('foo')).to.be.false;
        const foo = makeController('foo', ['foo'], []);
        ctrl.register(foo);
        expect(ctrl.has('foo')).to.be.true;
    });

    it('can delete', () => {
        const foo = makeController('foo', ['foo'], []);
        ctrl.register(foo);
        expect(() => ctrl.delete('foo')).not.to.throw(Error);
        expect(ctrl.has('foo')).to.be.false;
    });

    it('cannot delete dependency', () => {
        const foo = makeController('foo', ['foo'], []);
        const bar = makeController('bar', ['bar'], ['foo']);
        ctrl.register(foo);
        ctrl.register(bar);
        expect(() => ctrl.delete('foo')).to.throw(Error);
    });

    it('deleting a dependent removes dependency', () => {
        const foo = makeController('foo', ['foo'], []);
        const bar = makeController('bar', ['bar'], ['foo']);
        ctrl.register(foo);
        ctrl.register(bar);
        expect(() => ctrl.delete('bar')).not.to.throw(Error);
        expect(() => ctrl.delete('foo')).not.to.throw(Error);
        expect(ctrl.has('bar')).to.be.false;
        expect(ctrl.has('foo')).to.be.false;
    });

});

function makeController(name, aliases, dependencies) {
    let x;
    eval("x = function " + name + "() {}");
    x.register = {
        aliases: aliases,
        dependencies: dependencies
    };
    return x;
}