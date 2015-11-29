"use strict";

var logger   = require('../logger');
var data     = require('../api/data');
var question = require('readline-sync').question;

module.exports = function () {
	var appName = question('App Name: '.grey);
	var object = question('Object: '.grey);
	console.log(appName);
	console.log(object);

	if (!appName || !object) {
	  	logger.warn('Must input app name and object');
	  	return
	}

  	data.post(appName, JSON.parse(object));
}