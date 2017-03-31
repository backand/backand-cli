"use strict";
var fs = require('fs-extra');
var gulp = require('gulp');
var del = require('del');

var logger = require('../../logger');
var config = require('../../config');
var actionConfig = require('../../api/action');
var generalApi = require('../../api/general');


module.exports = function (appName, functionName, userToken, masterToken, token, folder) {

  logger.log("Delete function started. Function name: " + functionName + ", app name:" +
      " " + appName + "\n");

  var rootObject = "_root";
  var auth = masterToken + ':' + userToken;

  var lambdaId = null;

  gulp.task('clean', function(callback){
    return del(['*.zip']);
  });

  gulp.task('isAppExist', ['clean'], function (callback) {
    generalApi.appExists(appName, null, null, token, auth).then(function (exists) {
      if (!exists) {
        logger.warn("The app " + appName + " does not exist");
        process.exit(1);
      }
      callback();
    }, function (message) {
      logger.warn(message);
      process.exit(1);
    });

  });

  gulp.task('isFunctionAlreadyExist', ['isAppExist'], function (callback) {
    actionConfig.get(appName, rootObject, functionName, null, null, token, auth).then(function (lambdaObject) {
      if (!lambdaObject) {
        logger.warn("The function " + functionName + " does not exist");
        process.exit(1);
      }
      else{
        lambdaId = lambdaObject.iD;
        callback();
      }
    }, function (message) {
      logger.warn(message);
      process.exit(1);
    });
  });

  gulp.task('deleteFunction', ['isFunctionAlreadyExist'], function(callback){
    actionConfig.delete(appName, lambdaId, null, token, auth).then(function(data){
      console.log("Function '" + functionName +"' was deleted.");
      callback();
    }, function(message){
      logger.warn(message);
      process.exit(1);
    });
  });

  gulp.start('deleteFunction');

};