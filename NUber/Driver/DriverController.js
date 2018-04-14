var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Driver = require('./Driver');

//commands here
// might not need this since admin makes it. Just adding it
router.post('/', function (req, res) {
    if(req.body.car && req.body.name && req.body.currentCoords) {
        Driver.create({
                car: req.body.car,
                availability: 0,
                name: req.body.name,
                currentCustomer: 0,
                currentCoords: req.body.currentCoords.replace(/\s+/g, '+')
            },
            function (err, user) {
                if (err) return res.status(500).send("There was a problem adding the information to the database.");
                res.status(200).send(user);
            });
    }
});

router.put('/:id', function (req, res) {
    
    Driver.findByIdAndUpdate(req.params.id, {availability: req.body.availability}, {new: true}, function (err, driver) {
        if (err) return res.status(500).send("You must either be set as available(true) or unavailable(false).");
        res.status(200).send(driver);
    });
});

module.exports = router;