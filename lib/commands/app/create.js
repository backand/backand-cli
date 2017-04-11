"use strict";

var config =  require('../../config');
var logger   = require('../../logger');
var api     = require('../../api/general');
var question = require('readline-sync').question;

module.exports = function (options) {
	var appName = options.name || question('App Name: '.grey);
	var appTitle = options.title || question('App Title (optional): '.grey);

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
          logger.success("The app '" + appName + "' was created successfully!");
        }, function(err){
          logger.warn("The db creation was failed: ", err);
        })
    }, function(err){
      logger.warn("The app creation was failed: ", err);
    });

};