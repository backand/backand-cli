'use strict';


var question = require('readline-sync').question;
var logger   = require('../logger');
var exec     = require('child_process').exec;

module.exports = function () {
	var masterToken = question('Master Token: '.grey);
	var userToken = question('User Token: '.grey);
	var sourceFolder = question('Source Folder: '.grey);

	if (!masterToken || !userToken || !sourceFolder) {
		logger.warn('Must input master token, user token, and source folder');
		return
	}
		
	exec('node_modules/gulp/bin/gulp.js --gulpfile lib/gulp/gulpfile.js --user ' + masterToken + ' --pass ' + userToken + ' --f ' + sourceFolder, function(err, stdout, stderr){
		if (err){
			logger.warn('Sync failed');
		}
		else{
			logger.success('Sync completed succesfully');
		}
	});
	
};


