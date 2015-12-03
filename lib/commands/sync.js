'use strict';


var question = require('readline-sync').question;
var logger   = require('../logger');
var exec     = require('child_process').exec;
var tokenStorage = require('../api/token_storage');
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');

module.exports = function (options) {
	try {
		var token = tokenStorage.get();	
	}
	catch(err){
		logger.warn('Must login first');
		return
	}
	
	var sourceFolder = options.folder || question('Source Folder: '.grey);
	if (!sourceFolder) {
		logger.warn('Must input project source folder');
		return
	}

	gulp.task('sts', function(){
	    return backandSync.sts(null, null, token);
	});

	gulp.task('dist', ['sts'], function() { 
		return backandSync.dist(sourceFolder);
	});

	gulp.start('dist');
};


