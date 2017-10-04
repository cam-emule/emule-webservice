// Load mongoose package
var mongoose = require('mongoose');
// Create a schema
var MuleSchema = new mongoose.Schema({
    email: String,
    subdomains: [{type: mongoose.Schema.Types.ObjectId, ref: "AccessPoint"}]
});
// Create a model based on the schema
module.exports = mongoose.model('Mule', MuleSchema);

