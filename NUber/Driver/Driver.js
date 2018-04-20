var mongoose = require('mongoose');
var DriverSchema = new mongoose.Schema({
    car: String,
    availability: Boolean,
    name: String,
    currentCustomer: String,
    currentCoords: String,
    classification: String,
    totalCustomers: Number,
    rating: Number
});
mongoose.model('Driver', DriverSchema);

module.exports = mongoose.model('Driver');