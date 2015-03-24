"use strict";

var logger     = require('../logger');
var auth			 = require('../api/auth');
var tokenStore = require('../api/token_storage');
var http       = require('fs');
var question   = require('readline-sync').question;

module.exports = function () {
  var email = question('Email: '.grey);
  var fullname = question('Full Name: '.grey);
  var password = question('Password: '.grey, {noEchoBack: true});

  if (!email || !password) {
  	logger.warn('Must input email & password');
  	return
  }
	auth.register(email, password, fullname).then(function(data) {
		var token = data.access_token;
		tokenStore.set(token);
		logger.success("Welcome to backand! Create your first app by running")
			.log('backand (c)reate <appName>'.blue);
	});
};
