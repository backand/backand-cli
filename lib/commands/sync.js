'use strict';

var question = require('readline-sync').question;
var logger   = require('../logger');
var tokenStorage = require('../api/token-storage');
var gulp = require('gulp');
var backandSync = require('../api/backand-sync-s3');

module.exports = function (options) {


	var appName = options.app || question('App Name: '.grey);
	var sourceFolder = options.folder || question('Source Folder: '.grey);
	if (!appName || !sourceFolder) {
		logger.warn('Must input app name, and project source folder');
		return
	}
	if (!options.master || !options.user){
		try {
			var token = tokenStorage.get(appName);	
		}
		catch(err){
			logger.warn('Must login first');
			return
		}
	}

	if (!options.service){
		options.service = "hosting";
	}
	
	gulp.task('sts', function(){
		if (token)
	    	return backandSync.sts(null, null, token, appName);
	    else
	    	return backandSync.sts(options.master, options.user, null, appName);
	});

	gulp.task('dist', ['sts'], function() {
		return backandSync.dist(sourceFolder, appName, options.service, options.destFolder);
	});

	gulp.start('dist');
};


