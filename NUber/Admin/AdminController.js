var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Driver = require('../Driver/Driver');

router.post('/', function(req, res) {
    if(req.body.currentCoords)
    {
        var driverAdd = req.body.currentCoords.split(' ').join('+');
        var urlBeg = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=";
        var custAddress = "New+Braunfels,+Texas";
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

                body;

                if(body.rows[0].elements[0].status != "OK")
                {
                    return res.status(404).send("Invalid driver location");
                }
                else if(req.body.car && req.body.name && req.body.currentCoords)
                {
                    if(req.body.classification == "NUberXL" || req.body.classification == "NUberBLACK" || req.body.classification == "NUberSelect")
                    {
                        Driver.create({
                                car: req.body.car,
                                availability: 0,
                                name: req.body.name,
                                currentCustomer: 0,
                                currentCoords: req.body.currentCoords.replace(/\s+/g, '+'),
                                classification: req.body.classification,
                                totalCustomers: 0,
                                rating: 0
                            },
                            function (err, driver) {
                                if (err)
                                    return res.status(500).send("There was a problem adding a driver to the database");
                                return res.status(200).send(driver);
                            });
                    }
                    else
                    {
                        Driver.create({
                                car: req.body.car,
                                availability: 0,
                                name: req.body.name,
                                currentCustomer: 0,
                                currentCoords: req.body.currentCoords.replace(/\s+/g, '+'),
                                classification: "NUber",
                                totalCustomers: 0,
                                rating: 0
                            },
                            function (err, driver) {
                                if (err)
                                    return res.status(500).send("There was a problem adding a driver to the database");
                                return res.status(200).send(driver);
                            });
                    }

                } else {
                    res.status(400).send("Must input name, car, and currentCoords into body.");
                }
            });
        });
    }
});

router.delete('/:id', function(req, res){
    Driver.findByIdAndRemove(req.params.id, function(err, driver) {
        if(err)
            return res.status(500).send("There was a problem deleting the driver");
        return res.status(200).send("Driver " + driver.name + " was deleted");
    });
});

router.get('/', function(req, res){
    Driver.find({}, function(err, driver) {
        if(err)
            return res.status(500).send("There was a problem finding drivers");
        return res.status(200).send(driver);
    });
});

module.exports = router;
