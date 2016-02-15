var app = require("./express.js");
var express = require('express');
var join = require('path').join;

require('./test.js')(app);

app.use('/', express.static('tmp/instrumented/app'));
app.use('/', express.static('test'));
app.use('/src', express.static('src'));
app.use('/css', express.static('css'));

if (!process.argv[1] || process.argv[1].indexOf("mocha") === -1) {
  // Start server
  app.listen(8080, '0.0.0.0', function () {
    console.error("# Express server listening on " + this.address().port + " in " + app.get('env') + " mode");
  });
}
