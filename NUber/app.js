var express = require('express');
var app = express();
var db = require('./db');

var CustomerController = require('./Customer/CustomerController');
app.use('/customer', CustomerController);

module.exports = app;