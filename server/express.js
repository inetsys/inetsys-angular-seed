var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

//
// express initialization
//

var app = express();
app.use(bodyParser.json());
app.use(methodOverride());
app.use(function(req, res, next) {
  console.log("    ##", req.method, req.url);
  next();
});

module.exports = app;
