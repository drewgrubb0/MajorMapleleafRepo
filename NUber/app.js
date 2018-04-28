var express = require('express');
var app = express();
var db = require('./db');

var CustomerController = require('./Customer/CustomerController');
var DriverController = require('./Driver/DriverController');
var AdminController = require('./Admin/AdminController');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/customer', CustomerController);
app.use('/driver', DriverController);
app.use('/admin', AdminController);

module.exports = app;
