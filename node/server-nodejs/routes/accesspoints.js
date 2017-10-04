var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var AccessPoint = require('../models/AccessPoint.js');
/* GET /accesspoints listing. */
router.get('/', function(req, res, next) {
  AccessPoint.find(function (err, accesspoints) {
    if (err) return next(err);
    res.json(accesspoints);
  });
});
module.exports = router;
