var mongoose = require('mongoose');
var DriverSchema = new mongoose.Schema({
    id: Number,
    availability: Boolean,
    name: String,
    currentCustomer: Number,
    latitude: Number,
    longitude: Number
});
mongoose.model('Driver', DriverSchema);

module.exports = mongoose.model('Driver');