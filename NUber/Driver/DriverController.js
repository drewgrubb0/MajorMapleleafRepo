var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Driver = require('./Driver');

//commands here
// might not need this since admin makes it. Just adding it
router.post('/', function (req, res) {
    Driver.create({
            id: req.body.id,
            availability: 0,
            car: req.body.car,
            name: req.body.name,
            currentCustomer: 0,
            currentAddress: req.body.currentAddress
        }, 
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});

router.put('/:id', function (req, res) {
    
    Driver.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
        if (err) return res.status(500).send("You must either be set as available or unavailable.");
        res.status(200).send(user);
    });
});



module.exports = router;