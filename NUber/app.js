var express = require('express');
var app = express();
var db = require('./db');

var CustomerController = require('./Customer/CustomerController');
app.use('/customer', CustomerController);

var DriverController = require('./Driver/DriverController');
app.use('/driver', DriverController);

var AdminController = require('./Admin/AdminController');
app.use('/admin', AdminController);

module.exports = app;