"use strict";

var logger  		= require('../logger');
var data  			= require('../api/data');
var question    = require('readline-sync').question;

module.exports = function () {
	var appName = process.argv[3];
	var tableName = process.argv[4];
	data.get(appName, tableName);
};