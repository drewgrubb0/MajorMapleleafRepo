var mongoose = require('mongoose');
var DriverSchema = new mongoose.Schema({
    car: String,
    availability: Boolean,
    name: String,
    currentCustomer: String,
    currentAddress: String
});
mongoose.model('Driver', DriverSchema);

module.exports = mongoose.model('Driver');