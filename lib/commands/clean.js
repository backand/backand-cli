'use strict';


var question = require('readline-sync').question;
var logger   = require('../logger');
var exec     = require('child_process').exec;
var tokenStorage = require('../api/token_storage');
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');

module.exports = function () {
	gulp.task('clean', function() {
		return backandSync.clean();
	});
	gulp.start('clean');
};