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
const Typed             = require('../bin/typed');

describe('controllers', () => {
    let ctrl;

    beforeEach(() => {
        ctrl = controllers();
    });

    describe('register', () => {

        it('can register', () => {
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

        it('can auto alias to undefined', () => {
            const f = (function() {
                return function() {}
            })();
            function foo() {}
            foo.register = { aliases: [f] };
            ctrl.register(foo);

            const item = ctrl.get(f);
            expect(item.alias).to.equal('undefined');
        });

    });

    it('can match aliases', () => {
        const foo = makeController('foo', ['foo1', 'foo2'], []);
        ctrl.register(foo);
        expect(ctrl.is('foo1', 'bar')).to.be.false;
        expect(ctrl.is('foo1', 'foo2')).to.be.true;
    });

    it('can get list of controllers', () => {
        const foo = makeController('foo', ['foo', 'foo1'], []);
        const bar = makeController('bar', ['bar'], ['foo']);
        ctrl.register(foo);
        ctrl.register(bar);
        const items = ctrl.list();
        expect(items.length).to.equal(3);   // 3 because Typed is auto registered
    });

    it('has checks existence', () => {
        expect(ctrl.has('foo')).to.be.false;
        const foo = makeController('foo', ['foo'], []);
        ctrl.register(foo);
        expect(ctrl.has('foo')).to.be.true;
    });

    describe('inheritance', () => {

        it('inherits error', () => {
            const foo = makeController('foo', ['foo'], []);
            foo.prototype.error = function() {};
            const bar = makeController('bar', ['bar'], ['foo']);

            ctrl.register(foo);
            ctrl.register(bar);

            const data = ctrl.get('bar');
            expect(data.errorFunctions[1]).to.equal(foo.prototype.error);
        });

        it('inherits prototype methods', () => {
            const foo = makeController('foo', ['foo'], []);
            foo.prototype.normalize = function() {};
            const bar = makeController('bar', ['bar'], ['foo']);

            ctrl.register(foo);
            ctrl.register(bar);

            const data = ctrl.get('bar');
            expect(data.normalizeFunctions[1]).to.equal(foo.prototype.normalize);
        });

        it('inherits Typed ignored', () => {
            const foo = makeController('foo', ['foo'], ['typed']);
            ctrl.register(foo);
            const data = ctrl.get('foo');
            expect(data.controllers.length).to.equal(2);    // own controller and Typed controller
        });

    });

    describe('delete', () => {

        it('can delete', () => {
            const foo = makeController('foo', ['foo'], []);
            ctrl.register(foo);
            expect(() => ctrl.delete('foo')).not.to.throw(Error);
            expect(ctrl.has('foo')).to.be.false;
        });

        it('can delete if dne', () => {
            expect(() => ctrl.delete('foo')).not.to.throw(Error);
            expect(ctrl.has('foo')).to.be.false;
        });

        it('cannot delete Typed', () => {
            expect(() => ctrl.delete('typed')).to.throw(/Cannot delete core controller/);
        });

        it('cannot delete dependency', () => {
            const foo = makeController('foo', ['foo'], []);
            const bar = makeController('bar', ['bar'], ['foo']);
            ctrl.register(foo);
            ctrl.register(bar);
            expect(() => ctrl.delete('foo')).to.throw(Error);
        });

        it('deleting last dependent removes dependency', () => {
            const foo = makeController('foo', ['foo'], []);
            const bar = makeController('bar', ['bar'], ['foo']);
            ctrl.register(foo);
            ctrl.register(bar);
            expect(() => ctrl.delete('bar')).not.to.throw(Error);
            expect(() => ctrl.delete('foo')).not.to.throw(Error);
            expect(ctrl.has('bar')).to.be.false;
            expect(ctrl.has('foo')).to.be.false;
        });

        it('deleting not-last dependent does not remove dependency', () => {
            const foo = makeController('foo', ['foo'], []);
            const bar = makeController('bar', ['bar'], ['foo']);
            const baz = makeController('baz', ['baz'], ['foo']);
            ctrl.register(foo);
            ctrl.register(bar);
            ctrl.register(baz);
            expect(() => ctrl.delete('bar')).not.to.throw(Error);
            expect(() => ctrl.delete('foo')).to.throw(Error);
        });

    });

    describe('register errors', () => {

        it('controller must be a function', () => {
            expect(() => ctrl.register('abc')).to.throw(/must be a constructor function/);
        });

        it('controller does not have static register', () => {
            function foo() {}
            expect(() => ctrl.register(foo)).to.throw(/must have a static property/);
        });

        it('controller does not register alias', () => {
            function foo() {}
            foo.register = {};
            expect(() => ctrl.register(foo)).to.throw(/register aliases/);
        });

        it('dependencies not an array', () => {
            function foo() {}
            foo.register = {
                aliases: ['foo'],
                dependencies: 'abc'
            };
            expect(() => ctrl.register(foo)).to.throw(/register dependencies/);
        });

        it('alias in use', () => {
            const foo1 = makeController('foo', ['foo'], []);
            const foo2 = makeController('foo', ['foo'], []);
            ctrl.register(foo1);
            expect(() => ctrl.register(foo2)).to.throw(/already in use/);
        });

        it('dependency not defined', () => {
            const foo = makeController('foo', ['foo'], ['bar']);
            expect(() => ctrl.register(foo)).to.throw(/dependency not defined/);
        });

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