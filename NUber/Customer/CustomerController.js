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
        var custAddress = req.header("address");

        if(custAddress == null)
            return res.status(400).send("Please enter an address using a header labeled address");

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
            return res.status(404).send("Invalid address");
        else
        {
            var lazyOffset = 0;
            for(let i = 0 ; (i - lazyOffset) < drivers.length ; i++)
            {
                var currentDriver = drivers[i-lazyOffset];
                currentDriver._doc.distance = "";

                //Negative test for header to driver matching
                if(currentDriver.availability == false
                || (req.header("classification") != null && currentDriver.classification != req.header("classification"))   //If classification is specified but doesnt match
                || (req.header("rating") != null && currentDriver.rating < req.header("rating"))                            //If rating is specified but doesnt match
                || (req.header("distance") != null && body.rows[i].elements[0].distance.value > req.header("distance")))    //If distance is specified but doesnt match
                {
                    drivers.splice(i-lazyOffset, 1);
                    lazyOffset++;
                }
                else //If currentDriver meets the qualifications specified by the header
                {
                    drivers[i - lazyOffset]._doc.distance = body.rows[i].elements[0].distance.value;
                }
            }
            return res.status(200).send(drivers);
        }

    });
    });
    });
});

router.post('/', function (req, res) {
    var hasSentError = false;
    if(req.body.driverID && req.body.address && req.body.name) {
        Driver.findById(req.body.driverID, function (err, driver) { //checks to make sure driver exists and is available
            if(err) {
                hasSentError = true;
                return res.status(404).send("There was a problem finding the selected driver.");
            }

            if(driver.availability != true) {
                hasSentError = true;
                return res.status(400).send("Selected driver is no longer available");
            }
        });

        Customer.create({ //creates new customer in database
                name: req.body.name,
                address: req.body.address,
                driverID: req.body.driverID,
                canReview: false
            },
            function (err, user) {
                if (err) {
                    hasSentError = true;
                    return res.status(500).send("There was a problem adding the information to the database.");
                }
                else
                    Driver.findByIdAndUpdate(req.body.driverID, {availability: false, currentCustomer: user._id}, {new: true}, function (err) { //updates driver
                        if (err && hasSentError == false) {
                            hasSentError = true;
                            return res.status(501).send("There was a problem updating the selected driver in the database.");
                        }
                        if(hasSentError == false)
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

router.delete('/rate/:id', function (req, res) {
    if(req.rawHeaders[1] === "no-cache")
        res.status(500).send("Please input a valid rating");

    Customer.findById(req.params.id, function (err, customer) {
        if(err)
            return res.status(500).send("There was an error rating your driver");
        if(customer == null)
            return res.status(400).send("That customer does not exist in our database!");
        if(!customer.canReview)
            res.status(500).send("Hmmmm....Seems like you can't review");
        if(req.rawHeaders[1] < 1 || req.rawHeaders > 5)
            return res.status(500).send("Rating must be between 1 and 5");

        Driver.findById(customer.driverID, function (err, driver) {
            Driver.findByIdAndUpdate(customer.driverID, {totalCustomers: driver.totalCustomers + 1, rating: (parseInt(req.rawHeaders[1]) + driver.rating) / (driver.totalCustomers + 1)}, function (err, driver) {
                if(err)
                    return res.status(500).send("There was an error updating the driver");

                Customer.findByIdAndRemove(req.params.id, function(err, user) {
                    if(err)
                        return res.status(500).send("There was a problem deleting the customer");
                    return res.status(200).send("Driver has been rated! Customer " + user.name + " deleted from database.");
                });
            });
        });
    });
});

router.put('/cancel/:id', function(req, res){
    Customer.findByIdAndUpdate(req.params.id, {canReview: true}, function(err, customer) {
        if(err)
            return res.status(500).send("There was a problem cancelling your ride :(");

        if(customer == null)
            return res.status(400).send("That customer does not exist in our database!");

        Driver.findByIdAndUpdate(customer.driverID, {availability: false, currentCustomer: "0"}, function (err, driver) {
            if(err)
                return res.status(500).send("There was a problem updating your driver's availability...");
        })

        return res.status(200).send("Thank you for using NUber! Be sure to rate your driver!");
    });
});

router.delete('/:id', function(req, res){
    Customer.findByIdAndRemove(req.params.id, function(err, user) {
        if(user == null)
            return res.status(400).send("That customer was not found in the database");
        if(err)
            return res.status(500).send("There was a problem deleting the customer");
        return res.status(200).send("Customer " + user.name + " was deleted");
    });
});

module.exports = router;