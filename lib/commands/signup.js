"use strict";

var config     = require('../config');
var appCreate  = require('./app/create');
var logger     = require('../logger');
var auth			 = require('../api/auth');
var analytics	 = require('../api/analytics');
var tokenStore = require('../api/token-storage');
var question   = require('readline-sync').question;

module.exports = function (options) {

  //provide info if no options parameter and instruction for the wizard
  if(!options.email && !options.password){
    logger.log('You\'ll need an email, a password, and an app name to get started with Backand. You can supply' +
      ' these as parameters to the call:')
      .log('backand signup --email joe.user@backand.com --password Password123 --app mysuperapp\n'.blue)
      .log('Or you can complete the wizard below:\n');
  }

  var email = options.email || question('Email: '.grey);
  var password = options.password || question('Password: '.grey, {noEchoBack: true});
  var fullname = options.fullname;//make it simple without the full name. options.fullname || question('Full Name (optional): '.grey);

  var appName = options.app;
  if(!options.email && !options.password && !options.app){
    appName = question('App Name: '.grey);
  }

  var appTitle = options.title || appName;

  if (!email || !password) {
  	logger.warn('Must provide email & password');
  	return
  }

  if(!fullname || fullname === '')
    fullname = email.replace(/@.*$/,"");

  //analytics.identify(email, fullname);

  auth.register(email, password, fullname).then(function(data) {
   
	  //need to do signin to get token
    analytics.track(email, 'cli signup');
    auth.signin(email, password, config.mainAppName).then(function(data){

      var token = data.access_token;
      tokenStore.set(config.mainAppName, email, token);

      if(!appName){

        logger.success("Welcome to backand! Create your first app by running")
            .log('backand app create --name <appName> --title <appTitle>'.blue);
        process.exit(0);
      }
      else {
        logger.success("Welcome to backand!\n");
        //update the option for create
        options.name = appName;
        options.title = appTitle;
        options.email = email;
        options.password = password;
        appCreate(options);
      }
    },function(err){
      process.exit(1);
    });
	}, function(err){
    process.exit(1);
  });
};
