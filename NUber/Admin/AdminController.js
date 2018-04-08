var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//////////Needs to be set to require Driver correctly before it can work
var Driver = require('./Driver');
//////////Needs to be set to require Driver correctly before it can work

router.post('/', function(req, res) {
    Driver.create({
        id: req.body.id,
        availability: req.body.availability,
        name: req.body.name,
        currentCustomer: req.body.currentCustomer,
        currentAddress: req.body.currentAddress
    },
    function(err, driver) {
            if(err)
                return res.status(500).send("There was a problem adding a driver to the database");
            res.status(200).send(driver);
    });
});

router.delete('/:id', function(req, res){
    Driver.findByIdAndRemove(req.params.id, function(err, driver) {
        if(err)
            return res.status(500).send("There was a problem deleting the driver");
        return res.status(200).send(Driver + driver.name + " was deleted");
    });
});

module.exports = router;