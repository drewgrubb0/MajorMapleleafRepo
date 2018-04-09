var mongoose = require('mongoose');
var CustomerSchema = new mongoose.Schema({
    id: Number
    name: String,
    address: String
});
mongoose.model('Customer', CustomerSchema);

module.exports = mongoose.model('Customer');