"use strict";

var logger   = require('../logger');
var data     = require('../api/data');
var question = require('readline-sync').question;

module.exports = function (options) {
	var appName = options.app || question('App Name: '.grey);
	var object = options.object || question('Object: '.grey);


	if (!appName || !object) {
	  	logger.warn('Must input app name and object');
	  	return
	}
	if (options.app && options.object && (!options.master || !options.user)){
		logger.warn('Must provide master token and user token');
	  	return
	}

  	data.post(appName, JSON.parse(object), { 'auth': { user: options.master, password: options.user } });
}