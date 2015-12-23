'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var store = require('./');
var pkg;

describe('store', function() {
  beforeEach(function() {
    pkg = store('fixtures');
  });

  afterEach(function() {
    pkg.data = {};
    pkg.del({force: true});
  });

  it('should create a store with the given `name`', function() {
    pkg.set('foo', 'bar');
    assert(pkg.data.hasOwnProperty('foo'));
    assert.equal(pkg.data.foo, 'bar');
  });

  it('should create a store at the given `cwd`', function() {
    pkg = store('fixtures/foo');

    pkg.set('foo', 'bar');
    assert.equal(path.basename(pkg.path), 'package.json');
    assert(pkg.data.hasOwnProperty('foo'));
    assert.equal(pkg.data.foo, 'bar');
    assert.equal(fs.existsSync('fixtures/foo/package.json'), true);
  });

  it('should `.set()` a value on the store', function() {
    pkg.set('one', 'two');
    assert.equal(pkg.data.one, 'two');
  });

  it('should `.set()` an object', function() {
    pkg.set({four: 'five', six: 'seven'});
    assert.equal(pkg.data.four, 'five');
    assert.equal(pkg.data.six, 'seven');
  });

  it('should `.set()` a nested value', function() {
    pkg.set('a.b.c.d', {e: 'f'});
    assert.equal(pkg.data.a.b.c.d.e, 'f');
  });

  it('should `.union()` a value on the store', function() {
    pkg.union('one', 'two');
    assert.deepEqual(pkg.data.one, ['two']);
  });

  it('should not union duplicate values', function() {
    pkg.union('one', 'two');
    assert.deepEqual(pkg.data.one, ['two']);

    pkg.union('one', ['two']);
    assert.deepEqual(pkg.data.one, ['two']);
  });

  it('should concat an existing array:', function() {
    pkg.union('one', 'a');
    assert.deepEqual(pkg.data.one, ['a']);

    pkg.union('one', ['b']);
    assert.deepEqual(pkg.data.one, ['a', 'b']);

    pkg.union('one', ['c', 'd']);
    assert.deepEqual(pkg.data.one, ['a', 'b', 'c', 'd']);
  });

  it('should return true if a key `.has()` on the store', function() {
    pkg.set('foo', 'bar');
    pkg.set('baz', null);
    pkg.set('qux', undefined);

    assert(pkg.has('foo'));
    assert(!pkg.has('bar'));
    assert(!pkg.has('baz'));
    assert(!pkg.has('qux'));
  });

  it('should return true if a nested key `.has()` on the store', function() {
    pkg.set('a.b.c.d', {x: 'zzz'});
    pkg.set('a.b.c.e', {f: null});
    pkg.set('a.b.g.j', {k: undefined});

    assert(pkg.has('a.b.c.d'));
    assert(pkg.has('a.b.c.d.x'));
    assert(pkg.has('a.b.c.e'));
    assert(pkg.has('a.b.g.j'));

    assert(!pkg.has('a.b.bar'));
    assert(!pkg.has('a.b.c.d.z'));
    assert(!pkg.has('a.b.c.e.f'));
    assert(!pkg.has('a.b.c.e.z'));
    assert(!pkg.has('a.b.g.j.k'));
    assert(!pkg.has('a.b.g.j.z'));
  });

   it('should return true if a key exists `.hasOwn()` on the store', function() {
    pkg.set('foo', 'bar');
    pkg.set('baz', null);
    pkg.set('qux', undefined);

    assert(pkg.hasOwn('foo'));
    assert(!pkg.hasOwn('bar'));
    assert(pkg.hasOwn('baz'));
    assert(pkg.hasOwn('qux'));
  });

  it('should return true if a nested key exists `.hasOwn()` on the store', function() {
    pkg.set('a.b.c.d', {x: 'zzz'});
    pkg.set('a.b.c.e', {f: null});
    pkg.set('a.b.g.j', {k: undefined});

    assert(!pkg.hasOwn('a.b.bar'));
    assert(pkg.hasOwn('a.b.c.d'));
    assert(pkg.hasOwn('a.b.c.d.x'));
    assert(!pkg.hasOwn('a.b.c.d.z'));
    assert(!pkg.has('a.b.c.e.f'));
    assert(pkg.hasOwn('a.b.c.e.f'));
    assert(!pkg.hasOwn('a.b.c.e.bar'));
    assert(!pkg.has('a.b.g.j.k'));
    assert(pkg.hasOwn('a.b.g.j.k'));
    assert(!pkg.hasOwn('a.b.g.j.foo'));
  });

  it('should `.get()` a stored value', function() {
    pkg.set('three', 'four');
    assert.equal(pkg.get('three'), 'four');
  });

  it('should `.get()` a nested value', function() {
    pkg.set({a: {b: {c: 'd'}}});
    assert.equal(pkg.get('a.b.c'), 'd');
  });

  it('should `.del()` a stored value', function() {
    pkg.set('a', 'b');
    pkg.set('c', 'd');
    assert(pkg.data.hasOwnProperty('a'));
    assert.equal(pkg.data.a, 'b');

    assert(pkg.data.hasOwnProperty('c'));
    assert.equal(pkg.data.c, 'd');

    pkg.del('a');
    pkg.del('c');
    assert(!pkg.data.hasOwnProperty('a'));
    assert(!pkg.data.hasOwnProperty('c'));
  });

  it('should `.del()` multiple stored values', function() {
    pkg.set('a', 'b');
    pkg.set('c', 'd');
    pkg.set('e', 'f');
    pkg.del(['a', 'c', 'e']);
    assert.deepEqual(pkg.data, {});
  });
});

describe('events', function() {
  beforeEach(function() {
    pkg = store('fixtures');
  });

  afterEach(function() {
    pkg.data = {};
    pkg.del({force: true});
  });

  it('should emit `set` when an object is set:', function() {
    var keys = [];
    pkg.on('set', function(key) {
      keys.push(key);
    });

    pkg.set({a: {b: {c: 'd'}}});
    assert.deepEqual(keys, ['a']);
  });

  it('should emit `set` when a key/value pair is set:', function() {
    var keys = [];

    pkg.on('set', function(key) {
      keys.push(key);
    });

    pkg.set('a', 'b');
    assert.deepEqual(keys, ['a']);
  });

  it('should emit `set` when an object value is set:', function() {
    var keys = [];

    pkg.on('set', function(key) {
      keys.push(key);
    });

    pkg.set('a', {b: 'c'});
    assert.deepEqual(keys, ['a']);
  });

  it('should emit `set` when an array of objects is passed:', function() {
    var keys = [];

    pkg.on('set', function(key) {
      keys.push(key);
    });

    pkg.set([{a: 'b'}, {c: 'd'}]);
    assert.deepEqual(keys, ['a', 'c']);
  });

  it('should emit `has`:', function(done) {
    var keys = [];

    pkg.on('has', function(val) {
      assert(val);
      done();
    });

    pkg.set('a', 'b');
    pkg.has('a');
  });

  it('should emit `del` when a value is delted:', function(done) {
    pkg.on('del', function(keys) {
      assert.deepEqual(keys, 'a');
      assert(typeof pkg.get('a') === 'undefined');
      done();
    });

    pkg.set('a', {b: 'c'});
    assert.deepEqual(pkg.get('a'), {b: 'c'});
    pkg.del('a');
  });

  it('should emit deleted keys on `del`:', function(done) {
    var arr = [];

    pkg.on('del', function(key) {
      arr.push(key);
      assert(Object.keys(pkg.data).length === 0);
    });

    pkg.set('a', 'b');
    pkg.set('c', 'd');
    pkg.set('e', 'f');
    pkg.del({force: true});
    assert.deepEqual(arr, ['a', 'c', 'e']);
    done();
  });

  it('should throw an error if force is not passed', function(cb) {
    pkg.set('a', 'b');
    pkg.set('c', 'd');
    pkg.set('e', 'f');

    try {
      pkg.del();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'options.force is required to delete the entire cache.');
      cb();
    }
  });
});
