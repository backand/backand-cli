"use strict";

var logger  		= require('../logger');
var auth				= require('../api/auth');
var tokenStore 	= require('../api/token_storage');
var question    = require('readline-sync').question;

module.exports = function (options) {
  var email = options.master || question('email: '.grey);
  var password = options.user || question('Password: '.grey, {noEchoBack: true});
  var appName = options.app || question('App Name: '.grey);

  if (!email || !password || !appName) {
  	logger.warn('Must input email, password, and app name');
  	return
  }
	auth.signin(email, password, appName).then(function(data) {
		var token = data.access_token;
		logger.success("Logged in successfully");
		tokenStore.set(token);
	});
};