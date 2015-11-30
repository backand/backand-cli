'use strict';


var question = require('readline-sync').question;
var logger   = require('../logger');
var exec     = require('child_process').exec;
var tokenStorage = require('../api/token_storage');

module.exports = function () {

	try {
		var token = tokenStorage.get();	
	}
	catch(err){
		logger.warn('Must login first');
		return
	}
	
	var sourceFolder = options.folder || question('Source Folder: '.grey);
	if (!sourceFolder) {
		logger.warn('Must input master source folder');
		return
	}
	
	exec('node_modules/gulp/bin/gulp.js --gulpfile lib/gulp/gulpfile.js dist --token ' + token + ' --f ' + sourceFolder, function(err, stdout, stderr){
		if (err){
			logger.warn('Sync failed');
		}
		else{
			logger.success('Sync completed succesfully');
		}
	});
	
};


