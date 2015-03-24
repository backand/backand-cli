"use strict";

var logger  		= require('../logger');
var auth				= require('../api/auth');
var tokenStore 	= require('../api/token_storage');
var question    = require('readline-sync').question;

module.exports = function () {
  var email = question('email: '.grey);
  var password = question('Password: '.grey, {noEchoBack: true});

  if (!email || !password) {
  	logger.warn('Must input email & password');
  	return
  }
	auth.signin(email, password).then(function(data) {
		var token = data.access_token;
		logger.success("Logged in successfully");
		tokenStore.set(token);
	});
};