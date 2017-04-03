'use strict';

var logger   = require('../logger');
var exec     = require('child_process').exec;
var gulp = require('gulp');
var backandSync = require('../api/backand-sync-s3');

module.exports = function () {
	gulp.task('clean', function() {
		return backandSync.clean();
	});
	gulp.start('clean');
};