"use strict";

var logger  		= require('../logger');
var auth				= require('../api/auth');
var tokenStore 	= require('../api/token_storage');
var question    = require('readline-sync').question;

module.exports = function () {
  var username = question('Username: '.white);
  var password = question('Password: '.white, {noEchoBack: true});

  if (!username || !password) {
  	logger.warn('Must input username & password');
  	return
  }
	auth.signin(username, password).then(function(data) {
		var token = data.access_token;
		logger.success("Received token: " + token);
		tokenStore.set(token);
	});
};