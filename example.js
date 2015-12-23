'use strict';

var pkg = require('./')(process.cwd(), 'verb');

pkg.on('union', function() {
  console.log(arguments);
});

pkg.union('keywords', 'foo');
pkg.union('keywords', 'bar');
pkg.union('keywords', 'baz');

