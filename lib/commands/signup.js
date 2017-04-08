"use strict";

var config     = require('../config');
var appCreate        = require('./app/create');
var logger     = require('../logger');
var auth			 = require('../api/auth');
var tokenStore = require('../api/token-storage');
var question   = require('readline-sync').question;

module.exports = function (options) {
  var email = options.email || question('Email: '.grey);
  var password = options.password || question('Password: '.grey, {noEchoBack: true});
  var fullname = options.fullname || question('Full Name (optional): '.grey);
  var appName = options.app; // || question('App Name (optional): '.grey);
  var title = options.title;

  if (!email || !password) {
  	logger.warn('Must input email & password');
  	return
  }

  if(fullname === '')
    fullname = email.replace(/@.*$/,"");

	auth.register(email, password, fullname).then(function(data) {
   
	  //need to do signin to get token
    auth.signin(email, password, config.mainAppName).then(function(data){

      var token = data.access_token;
      tokenStore.set(config.mainAppName, token);

      if(!appName || !title){

        logger.success("Welcome to backand! Create your first app by running")
            .log('backand app create --name <appName> --title <appTitle>'.blue);
      }
      else {
        //update the option for create
        options.name = appName;
        return appCreate(options);
      }
    });

	});
};
