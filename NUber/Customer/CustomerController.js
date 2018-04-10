var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Customer = require('./Customer');
var Driver = require('../Driver/Driver');

router.get('/', function (req, res) {
    Driver.find({}, function (err, drivers) {
        if (err) return res.status(500).send("There was a problem finding the drivers.");
        if (drivers.length == 0) return res.status(404).send("No drivers were found");
        var driverAdd = "";

        for(var i = 0; i < drivers.length; i++) {
            driverAdd += drivers[i].currentAddress;
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

module.exports = router;