var mongoose = require('mongoose');
var DriverSchema = new mongoose.Schema({
    car: String,
    availability: Boolean,
    name: String,
    currentCustomer: Number,
    currentAddress: String
});
mongoose.model('Driver', DriverSchema);

module.exports = mongoose.model('Driver');