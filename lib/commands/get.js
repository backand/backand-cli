"use strict";

var logger   = require('../logger');
var data     = require('../api/general');
var question = require('readline-sync').question;

module.exports = function (options) {
	var appName = options.app || question('App Name: '.grey);
	var tableName = options.object || question('Object: '.grey);

	if (!appName || !tableName) {
	  	logger.warn('Must input app name and table');
	  	return
	}
	if (options.object && (!options.master || !options.user)){
		logger.warn('Must provide master token and user token');
	  	return
	}

	data.get(appName, tableName, null, null, options.master + ':' + options.user);
};