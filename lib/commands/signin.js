"use strict";

var config =  require('../config');
var logger  		= require('../logger');
var auth				= require('../api/auth');
var tokenStore 	= require('../api/token-storage');
var question    = require('readline-sync').question;
var analytics			 = require('../api/analytics');

module.exports = function (options) {

  //provide info if no options parameter and instruction for the wizard
  if(!options.email && !options.password){
    logger.log('Provide your email, password and app name to sign in. You can supply these as parameters to the call:')
        .log('backand signin --email joe.user@backand.com --password Password123 --app mysuperapp\n'.blue)
        .log('Or you can complete the wizard below:\n');
  }

  var email = options.email || question('Email: '.grey);
  var password = options.password || question('Password: '.grey, {noEchoBack: true});
  var appName = options.app; // || question('App Name (optional): '.grey);

  if(!options.email && !options.password && !options.app){
    appName = question('App Name: '.grey);
  }

  if (!appName)
    appName = config.mainAppName;

  if (!email || !password || !appName) {
  	logger.warn('Must input email, password, and app name');
  	return
  }

	auth.signin(email, password, appName).then(function(data) {
    var appText = (appName === config.mainAppName) ? "Backand" : "app '" + appName + "'";
		tokenStore.set(appName, email, data.access_token);
    logger.success("Logged in successfully to " + appText);
    analytics.track(email, 'cli signin', {app: appName});
    process.exit(0);
	}, function(err){
    process.exit(1);
  });


};