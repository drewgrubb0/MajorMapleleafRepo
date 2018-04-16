var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Customer = require('./Customer');
var Driver = require('../Driver/Driver');

router.get('/:id', function(req, res){
    Customer.findById(req.params.id, function(err, user) {
        if(err) return res.status(500).send("There was a problem finding the customer");
        if(user == null) return res.status(404).send("Customer with given id does not exist");

        if(user.driverID == 0) return res.status(404).send("Customer does not have  assigned driver");
        Driver.findById(user.driverID, function (err, driver) {
            if(err) return res.status(404).send("There was a problem finding the selected driver.");
            if(driver == null) return res.status(404).send("Driver with given id does not exist");

            var urlBeg = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=";
            var custAddress = driver.currentCoords.split(' ').join('+');;
            var driverAdd = user.address.split(' ').join('+');;
            var key = "&key=AIzaSyCL-_lJA8fRyWYnYs-4jq3rBpZweaWvQ-U";
            var url = urlBeg + driverAdd + "&destinations=" + custAddress + key;

            const https = require("https");
            https.get(url, ress => {
                ress.setEncoding("utf8");
                let body = "";
                ress.on("data", data => {
                    body += data;
                });
                ress.on("end", () => {
                    body = JSON.parse(body);
                    return res.status(200).send(body.rows[0].elements[0].duration);
                });
            });
        });
    });
});

router.get('/', function (req, res) {
    Driver.find({}, function (err, drivers) {
        if (err) return res.status(500).send("There was a problem finding the drivers.");
        if (drivers.length == 0) return res.status(404).send("No drivers were found");
        var driverAdd = "";

        for(var i = 0; i < drivers.length; i++) {
            driverAdd += drivers[i].currentCoords;
            if(i + 1 != drivers.length)
                driverAdd += "|";
        }
        var driverAdd = driverAdd.split(' ').join('+');
        var urlBeg = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=";
        var custAddress = req.rawHeaders[5];
        custAddress = custAddress.split(' ').join('+');
        var key = "&key=AIzaSyCL-_lJA8fRyWYnYs-4jq3rBpZweaWvQ-U";
        var url = urlBeg + driverAdd + "&destinations=" + custAddress + key;

        const https = require("https");
        https.get(url, ress => {
            ress.setEncoding("utf8");
            let body = "";
            ress.on("data", data => {
                body += data;
            });
            ress.on("end", () => {
                body = JSON.parse(body);

                if(body.rows[0].elements[0].status == "NOT_FOUND")
                    res.status(404).send("Invalid address");
                else{
                    var lazyOffset = 0;
                    for(var i = 0; i - lazyOffset < drivers.length; i++){
                        drivers[i - lazyOffset]._doc.distance = "";
                        if(drivers[i - lazyOffset].availability && body.rows[i].elements[0].distance.value <= req.rawHeaders[7]){
                            drivers[i - lazyOffset]._doc.distance = body.rows[i].elements[0].distance.value;
                        }
                        else{
                            drivers.splice(i - lazyOffset, 1);
                            lazyOffset++;
                        }
                    }
                    res.status(200).send(drivers);
                }
            });
        });
    });
});

router.post('/', function (req, res) {
    if(req.body.driverID && req.body.address && req.body.name) {
        Driver.findById(req.body.driverID, function (err, driver) { //checks to make sure driver exists and is available
            if(err) return res.status(404).send("There was a problem finding the selected driver.");
            if(driver.availability != true) return res.status(400).send("Selected driver is no longer available");
        });

        Customer.create({ //creates new customer in database
                name: req.body.name,
                address: req.body.address,
                driverID: req.body.driverID
            },
            function (err, user) {
                if (err) return res.status(500).send("There was a problem adding the information to the database.");
                Driver.findByIdAndUpdate(req.body.driverID, {availability: false, currentCustomer: user._id}, {new: true}, function (err) { //updates driver
                    if (err) return res.status(500).send("There was a problem updating the selected driver in the database.");
                    res.status(200).send(user);
                });
            });

    } else {
        res.status(400).send("Must input name, address, and driverID into body.");
    }
});

router.get('/all', function(req, res){ //used for debugging, shows all customers in database
    Customer.find({}, function(err, user) {
        if(err)
            return res.status(500).send("There was a problem finding customers");
        return res.status(200).send(user);
    });
});

router.delete('/:id', function(req, res){ //used to delete customers, should be edited for customer cancellations
    Customer.findByIdAndRemove(req.params.id, function(err, user) {
        if(err)
            return res.status(500).send("There was a problem deleting the customer");
        return res.status(200).send("Driver " + user.name + " was deleted");
    });
});

module.exports = router;