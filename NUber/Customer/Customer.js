var mongoose = require('mongoose');
var CustomerSchema = new mongoose.Schema({
    name: String,
    address: String,
    driverID: String
});
mongoose.model('Customer', CustomerSchema);

module.exports = mongoose.model('Customer');