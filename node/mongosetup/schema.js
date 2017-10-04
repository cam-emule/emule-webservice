// Load mongoose package
var mongoose = require('mongoose');
// Connect to MongoDB and create/use database called todoAppTest
mongoose.connect('mongodb://localhost/eMule');
// Create a schema
var AccessPointSchema = new mongoose.Schema({
  name: String,
  latitude: String,
  longitude: String,
  description:String,
  imageurl:String,
  updated_at: { type: Date, default: Date.now },
});
// Create a model based on the schema
var AccessPoint = mongoose.model('Todo', AccessPointSchema);

