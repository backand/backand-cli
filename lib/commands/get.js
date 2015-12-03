"use strict";

var logger   = require('../logger');
var data     = require('../api/data');
var question = require('readline-sync').question;

module.exports = function (options) {
	var appName = options.app || question('App Name: '.grey);
	var tableName = options.object || question('Object: '.grey);

	if (!appName || !tableName) {
	  	logger.warn('Must input app name and table');
	  	return
	}

	data.get(appName, tableName);
};