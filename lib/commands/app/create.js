"use strict";

var question = require('readline-sync').question;

var config  = require('../../config');
var logger  = require('../../logger');
var api     = require('../../api/general');
var signin  = require('../signin');

module.exports = function (options) {

  if(!options.name){
    logger.log('You\'ll need an app name to create a Backand application. You can supply these as parameters to the' +
        ' call:')
        .log('backand app create --name myBackandApp\n'.blue)
        .log('Or you can complete the wizard below:\n');
  }

  var appName = options.name || question('App Name: '.grey);

	var appTitle = options.title || appName;
  if(!options.name) {
    appTitle = question('App Title (optional): '.grey);
  }

  api.init(config.mainAppName, options.master, options.user);

	if (!appName) {
	  	logger.warn('Must input app name');
	  	return
	}

  //POST '/admin/myApps/' + data: {Name: name,Title: title}
  //POST '/admin/myAppConnection/' + appName + data: {"product": 10, "sampleApp": "", "schema": schema}

  api.appCreate({Name: appName, Title: appTitle}, null, null)
    .then(function(data) {
      api.dbCreate(appName,{product: 10, sampleApp: '', schema: ''}, null, null)
        .then(function(data) {
          logger.success("The app '" + appName + "' was created successfully!\n");

          //sign in to this app after create
          if(options.email && options.password) {
            options.app = appName;
            signin(options);
          } else {
            process.exit(0);
          }
        }, function(err){
          logger.warn("DB creation failed: ", err);
          process.exit(1);
        })
    }, function(err){
      logger.warn("App creation failed: ", err);
      process.exit(1);
    });

};