"use strict";

var config =  require('../config');
var logger  		= require('../logger');
var auth				= require('../api/auth');
var tokenStore 	= require('../api/token-storage');
var question    = require('readline-sync').question;

module.exports = function (options) {
  var email = options.email || question('Email: '.grey);
  var password = options.password || question('Password: '.grey, {noEchoBack: true});
  var appName = options.app; // || question('App Name (optional): '.grey);

  if (!appName)
    appName = config.mainAppName;

  if (!email || !password || !appName) {
  	logger.warn('Must input email, password, and app name');
  	return
  }

	auth.signin(email, password, appName).then(function(data) {
		var token = data.access_token;
		logger.success("Logged in successfully to " + appName);
		tokenStore.set(appName, token);
	});


};