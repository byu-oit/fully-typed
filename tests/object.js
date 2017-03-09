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

        it('properties cannot be null', () => {
            const properties = null;
            const e = util.extractError(() => Schema({ type: Object, properties: properties }));
            expect(e.code).to.equal(util.errors.config.code);
        });

        it('properties can be a plain object', () => {
            const properties = {};
            expect(() => Schema({ type: Object, properties: properties })).not.to.throw(Error);
        });

        it('properties can be an array of plain objects', () => {
            const properties = [{}];
            expect(() => Schema({ type: Object, properties: properties })).not.to.throw(Error);
        });

        it('properties cannot be an array with a non plain objects', () => {
            const properties = [null];
            const e = util.extractError(() => Schema({ type: Object, properties: properties }));
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

    describe('general schema', () => {

        it('can have schema property', () => {
            const o = Schema({ type: Object, schema: { type: String } });
            expect(o).to.have.ownProperty('schema');
        });

        it('cannot be a null object', () => {
            const config = { type: Object, schema: null };
            expect(() => Schema(config)).to.throw(Error);
        });

        it('can be a non null object', () => {
            const config = { type: Object, schema: { type: String } };
            expect(() => Schema(config)).to.not.throw(Error);
        });

        it('can be an array of objects', () => {
            const config = { type: Object, schema: [{ type: String }, { type: Number }] };
            expect(() => Schema(config)).to.not.throw(Error);
        });

        describe('extends across properties', () => {
            let o;

            describe('plain specific and plain general', () => {

                before(() => {
                    o = Schema({
                        type: Object,
                        properties: {
                            a: {
                                type: String
                            },
                            b: {
                                type: Number
                            },
                            c: {
                                required: false
                            }
                        },
                        schema: {
                            type: Boolean,
                            minLength: 10,
                            min: 10,
                            required: true
                        }
                    });
                });

                it('a', () => {
                    expect(o.properties.a.type).to.equal(String);
                    expect(o.properties.a.minLength).to.equal(10);
                    expect(o.properties.a).not.to.have.ownProperty('min');
                    expect(o.properties.a.required).to.be.true;
                });

                it('b', () => {
                    expect(o.properties.b.type).to.equal(Number);
                    expect(o.properties.b.min).to.equal(10);
                    expect(o.properties.b).not.to.have.ownProperty('minLength');
                    expect(o.properties.b.required).to.be.true;
                });

                it('c', () => {
                    expect(o.properties.c.type).to.equal(Boolean);
                    expect(o.properties.c).not.to.have.ownProperty('min');
                    expect(o.properties.c).not.to.have.ownProperty('minLength');
                    expect(o.properties.c.required).to.be.false;
                });

            });

            describe('plain specific and array general', () => {
                let o;

                before(() => {
                    o = Schema({
                        type: Object,
                        properties: {
                            a: {
                                type: String
                            },
                            b: {
                                type: Number
                            },
                            c: {
                                required: false
                            }
                        },
                        schema: [{
                            type: Boolean,
                            required: true
                        }]
                    });
                });

                it('a', () => {
                    expect(o.properties.a.schemas[0].type).to.equal(String);
                    expect(o.properties.a.schemas[0].required).to.be.true;
                    expect(o.properties.a.schemas.length).to.equal(1);
                });

                it('b', () => {
                    expect(o.properties.b.schemas[0].type).to.equal(Number);
                    expect(o.properties.b.schemas[0].required).to.be.true;
                    expect(o.properties.b.schemas.length).to.equal(1);
                });

                it('c', () => {
                    expect(o.properties.c.schemas[0].type).to.equal(Boolean);
                    expect(o.properties.c.schemas[0].required).to.be.false;
                    expect(o.properties.c.schemas.length).to.equal(1);
                });

            });

            describe('array specific and plain general', () => {
                let o;

                before(() => {
                    o = Schema({
                        type: Object,
                        properties: {
                            a: [
                                {
                                    type: String
                                },
                                {
                                    type: Number,
                                    required: false
                                }
                            ]
                        },
                        schema: {
                            type: Boolean,
                            required: true
                        }
                    });
                });

                it('has 2 distinct configurations', () => {
                    expect(o.properties.a.schemas.length).to.equal(2);
                });

                it('a[0]', () => {
                    expect(o.properties.a.schemas[0].type).to.equal(String);
                    expect(o.properties.a.schemas[0].required).to.be.true;
                });

                it('a[1]', () => {
                    expect(o.properties.a.schemas[1].type).to.equal(Number);
                    expect(o.properties.a.schemas[1].required).to.be.false;
                });

            });

            describe('array specific and array general', () => {
                let o;

                before(() => {
                    o = Schema({
                        type: Object,
                        properties: {
                            a: [
                                {
                                    type: String
                                },
                                {
                                    type: Number
                                }
                            ]
                        },
                        schema: [
                            {
                                type: String,
                                required: true
                            },
                            {
                                type: Number
                            },
                            {
                                min: 0
                            }
                        ]
                    });
                });


                // some combinations create the same configuration, there are 5 distinct configurations here
                it('has 5 distinct configurations', () => {
                    expect(o.properties.a.schemas.length).to.equal(5);
                });

                it('a[0]', () => {
                    const s = o.properties.a.schemas[0];
                    expect(s.type).to.equal(String);
                    expect(s.required).to.be.true;
                });

                it('a[1]', () => {
                    const s = o.properties.a.schemas[1];
                    expect(s.type).to.equal(String);
                    expect(s.required).to.be.false;
                });

                it('a[2]', () => {
                    const s = o.properties.a.schemas[2];
                    expect(s.type).to.equal(Number);
                    expect(s.required).to.be.true;
                    expect(s.min).to.be.NaN;
                });

                it('a[3]', () => {
                    const s = o.properties.a.schemas[3];
                    expect(s.type).to.equal(Number);
                    expect(s.required).to.be.false;
                    expect(s.min).to.be.NaN;
                });

                it('a[4]', () => {
                    const s = o.properties.a.schemas[4];
                    expect(s.type).to.equal(Number);
                    expect(s.required).to.be.false;
                    expect(s.min).to.equal(0);
                });

            });

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

        it('checks for array of schemas', () => {
            const o = Schema({ type: Object, properties: { x: [{ type: Number }, {type: String}] } });
            expect(o.error({ x: 'hello' })).to.be.null;
            expect(o.error({ x: 123 })).to.be.null;
            expect(o.error({ x: true })).not.to.be.null;
        });

        // TODO: validate non-specified parameters against general schema
        /*describe('schema', () => {

            describe('extends across properties', () => {
                let o;

                before(() => {
                    o = Schema({
                        type: Object,
                        properties: {
                            a: {
                                type: String
                            },
                            b: {
                                type: Number
                            }
                        },
                        schema: {

                        }
                    });
                });

            });

        });*/



        /*before(() => {
            o = Schema({
                type: Object,
                properties: {
                    a: [
                        {
                            type: String
                        },
                        {
                            type: Number
                        }
                    ]
                },
                schema: {
                    type: Boolean,
                    required: true
                }
            });
        });*/

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