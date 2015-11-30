'use strict';
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');
var minimist = require('minimist');

var options = minimist(process.argv.slice(2));

gulp.task('sts', function(){
	console.log('sts');
    return backandSync.sts(options.user, options.pass, options.token);
});

// erase deleted files. upload new and changes only
gulp.task('dist', ['sts'], function() { 
	console.log('dist');  
    var folder = options.f;
	return backandSync.dist(folder);
});

// clean cache of gulpfile if it gets confused about delete/insert of same file in same bucket
gulp.task('clean', function() {
	console.log('clean');
	return backandSync.clean();
});
 
gulp.task('default', ['dist']);