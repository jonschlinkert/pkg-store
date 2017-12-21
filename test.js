'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const writeJson = require('write-json');
const del = require('delete');
const Store = require('./');
const fixtures = path.resolve.bind(path, 'fixtures');
let pkg;

describe('store', function() {
  beforeEach(function() {
    return writeJson(fixtures('package.json'), {})
      .then(() => {
        pkg = new Store(fixtures());
      });
  });

  afterEach(function() {
    return del(fixtures());
  });

  describe('resolve store path', function() {
    it('should get a store at the given "cwd"', function() {
      return writeJson(fixtures('foo/package.json'), {})
        .then(() => {
          pkg = new Store(fixtures('foo'));
          pkg.set('foo', 'bar');
          assert.equal(path.basename(pkg.path), 'package.json');
          assert(pkg.data.hasOwnProperty('foo'));
          assert.equal(pkg.data.foo, 'bar');
          assert(fs.existsSync('fixtures/foo/package.json'));
        });
    });

    it('should get a store at the given "options.path"', function() {
      return writeJson(fixtures('foo/bar.json'), {})
        .then(() => {
          pkg = new Store({path: fixtures('foo/bar.json')});
          pkg.set('foo', 'bar');
          assert.equal(path.basename(pkg.path), 'bar.json');
          assert(pkg.data.hasOwnProperty('foo'));
          assert.equal(pkg.data.foo, 'bar');
          assert(fs.existsSync('fixtures/foo/bar.json'));
        });
    });
  });

  describe('.set', function() {
    it('should set a value on the store', function() {
      pkg.set('one', 'two');
      assert.equal(pkg.data.one, 'two');
    });

    it('should set an object', function() {
      pkg.set({four: 'five', six: 'seven'});
      assert.equal(pkg.data.four, 'five');
      assert.equal(pkg.data.six, 'seven');
    });

    it('should set a nested value', function() {
      pkg.set('a.b.c.d', {e: 'f'});
      assert.equal(pkg.data.a.b.c.d.e, 'f');
    });
  });

  describe('.union', function() {
    it('should union a value on the store', function() {
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
  });

  describe('.has', function() {
    it('should return true if a key has on the store', function() {
      pkg.set('foo', 'bar');
      pkg.set('baz', null);
      pkg.set('qux', undefined);

      assert(pkg.has('baz'));
      assert(pkg.has('foo'));
      assert(!pkg.has('bar'));
      assert(!pkg.has('qux'));
    });

    it('should return true if a nested key has on the store', function() {
      pkg.set('a.b.c.d', {x: 'zzz'});
      pkg.set('a.b.c.e', {f: null});
      pkg.set('a.b.g.j', {k: undefined});

      assert(pkg.has('a.b.c.d'));
      assert(pkg.has('a.b.c.d.x'));
      assert(pkg.has('a.b.c.e'));
      assert(pkg.has('a.b.g.j'));
      assert(pkg.has('a.b.c.e.f'));

      assert(!pkg.has('a.b.bar'));
      assert(!pkg.has('a.b.c.d.z'));
      assert(!pkg.has('a.b.c.e.z'));
      assert(!pkg.has('a.b.g.j.k'));
      assert(!pkg.has('a.b.g.j.z'));
    });
  });

  describe('.get', function() {
    it('should get a stored value', function() {
      pkg.set('three', 'four');
      assert.equal(pkg.get('three'), 'four');
    });

    it('should get a nested value', function() {
      pkg.set({a: {b: {c: 'd'}}});
      assert.equal(pkg.get('a.b.c'), 'd');
    });
  });

  describe('.save', function() {
    it('should save the store', function() {
      pkg.set('three', 'four');
      pkg.save();
      var obj = require(fixtures('package.json'));
      assert.deepEqual(obj, {three: 'four'});
    });
  });

  describe('.del', function() {
    it('should delete a stored value', function() {
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

    it('should delete multiple stored values', function() {
      pkg.set('a', 'b');
      pkg.set('c', 'd');
      pkg.set('e', 'f');
      pkg.del(['a', 'c', 'e']);
      assert.deepEqual(pkg.data, {});
    });
  });
});
