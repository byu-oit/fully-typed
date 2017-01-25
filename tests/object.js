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
const TypedObject       = require('../bin/object');
const util              = require('../bin/util');

describe('TypedObject', () => {

    describe('properties', () => {

        it('properties must be plain object', () => {
            const e = util.extractError(() => Schema({ type: Object, properties: null }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('property cannot be number', () => {
            const e = util.extractError(() => Schema({ type: Object, properties: { a: 123 } }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('property can be null', () => {
            expect(() => Schema({ type: Object, properties: { a: null } })).to.not.throw(Error);
        });

        it('property can be object', () => {
            expect(() => Schema({ type: Object, properties: { a: {} } })).to.not.throw(Error);
        });

    });

    describe('allow null', () => {

        it('defaults to true', () => {
            const o = Schema({ type: Object });
            expect(o.allowNull).to.be.true;
        });

        it('can be set to false', () => {
            const o = Schema({ type: Object, allowNull: false });
            expect(o.allowNull).to.be.false;
        });

    });

    describe('schema per property', () => {

        it('accepts objects per property', () => {
            const o = Schema({ type: Object, properties: { a: {}, b: {} } });
            expect(o.properties).to.haveOwnProperty('a');
            expect(o.properties).to.haveOwnProperty('b');
        });

        it('property is schema', () => {
            const o = Schema({ type: Object, properties: { a: null } });
            expect(o.properties.a.constructor.name).to.equal('Schema');
        });

    });

    describe('required', () => {

        it('can have required property', () => {
            const o = Schema({ type: Object, properties: { x: { required: true }} });
            expect(o.properties.x.required).to.be.true;
        });

        it('can not-have required property', () => {
            const o = Schema({ type: Object, properties: { x: { required: false }} });
            expect(o.properties.x.required).to.be.false;
        });

        it('defaults to not required', () => {
            const o = Schema({ type: Object, properties: { x: null } });
            expect(o.properties.x.required).to.be.false;
        });

        it('cannot be required and have default', () => {
            const err = util.extractError(() => Schema({ type: Object, properties: { x: { required: true, default: 5 } } }));
            expect(err.code).to.equal(Typed.errors.config.code);
            expect(/Cannot make required and provide a default/.test(err.message)).to.be.true;
        });

    });

    describe('#error', () => {

        it('checks type', () => {
            const o = Schema({ type: Object });
            const err = o.error(123);
            expect(err.code).to.equal(util.errors.type.code);
        });

        it('do not allow null', () => {
            const o = Schema({ type: Object, allowNull: false });
            const err = o.error(null);
            expect(err.code).to.equal(TypedObject.errors.null.code);
        });

        it('can be errorless', () => {
            const o = Schema({ type: Object, properties: { x: { required: true, type: Number }}});
            const err = o.error({ x: 5 });
            expect(err).to.be.null;
        });

        it('must have required property', () => {
            const o = Schema({ type: Object, properties: { x: { required: true }} });
            const err = o.error({});
            expect(err.errors.length).to.equal(1);
            expect(err.errors[0].code).to.equal(TypedObject.errors.required.code);
            expect(err.errors[0].property).to.equal('x');
        });

        it('checks for inherited errors', () => {
            const o = Schema({ type: Object, properties: { x: { type: Number }} });
            const err = o.error({ x: 'hello' });
            expect(err.errors.length).to.equal(1);
            expect(err.errors[0].code).to.equal(Typed.errors.type.code);
            expect(err.errors[0].property).to.equal('x');
        });

    });

    describe('#normalize', () => {

        it('can clean properties', () => {
            const o = Schema({ type: Object, clean: true, properties: { x: {}} });
            const v = o.normalize({ x: 5, y: 10 });
            expect(v.x).to.equal(5);
            expect(v.y).to.be.undefined;
        });

        it('can keep all properties', () => {
            const o = Schema({ type: Object, clean: false, properties: { x: {}} });
            const v = o.normalize({ x: 5, y: 10 });
            expect(v.x).to.equal(5);
            expect(v.y).to.equal(10);
        });

        it('normalizes properties', () => {
            const o = Schema({
                type: Object,
                properties: {
                    x: {
                        default: 'foo'
                    }
                }
            });
            const v = o.normalize({});
            expect(v.x).to.equal('foo');
        });

    });

});