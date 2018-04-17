var mongoose = require('mongoose');
var CustomerSchema = new mongoose.Schema({
    name: String,
    address: String,
    driverID: String,
    canReview: Boolean
});
mongoose.model('Customer', CustomerSchema);

module.exports = mongoose.model('Customer');