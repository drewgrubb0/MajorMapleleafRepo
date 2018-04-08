var express = require('express');
var app = express();
var db = require('./db');

var CustomerController = require('./Customer/CustomerController');
var DriverController = require('./Driver/DriverController');
var AdminController = require('./Admin/AdminController');

app.use('/customer', CustomerController);
app.use('/driver', DriverController);
app.use('/admin', AdminController);

module.exports = app;