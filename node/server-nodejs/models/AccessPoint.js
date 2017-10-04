// Load mongoose package
var mongoose = require('mongoose');
// Create a schema
//Consider geoJson here.
var AccessPointSchema = new mongoose.Schema({
  name: String,
  subdomain: String,
  loc :
	  [Number, Number] 
  ,
  description:String,
  imageurl:String,
  updated_at: { type: Date, default: Date.now },
});
// Create a model based on the schema
module.exports = mongoose.model('AccessPoint', AccessPointSchema);

