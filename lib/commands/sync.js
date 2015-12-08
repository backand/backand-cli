'use strict';


var question = require('readline-sync').question;
var logger   = require('../logger');
var exec     = require('child_process').exec;
var tokenStorage = require('../api/token_storage');
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');

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

	gulp.task('sts', function(){
		if (token)
	    	return backandSync.sts(null, null, token);
	    else
	    	return backandSync.sts(options.master, options.user, null);
	});

	gulp.task('dist', ['sts'], function() { 
		return backandSync.dist(sourceFolder, appName);
	});

	gulp.start('dist');
};


