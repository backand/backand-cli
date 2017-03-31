"use strict";
var fs = require('fs-extra');
var gulp = require('gulp');
var del = require('del');

var logger = require('../../logger');
var config = require('../../config');
var actionConfig = require('../../api/action');
var generalApi = require('../../api/general');

module.exports = function (appName, objectName, actionName, userToken, masterToken, token, folder) {

    logger.log("Delete action started. action name: " + actionName + ", object name: " + objectName + ", app name: " + appName + "\n");

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

    gulp.task('isObjectExist', ['isAppExist'], function (callback) {
        generalApi.objectExists(appName, objectName, null, null, token, auth).then(function (exists) {
            if (!exists) {
                logger.warn("The object " + objectName + " does not exist");
                process.exit(1);
            }
            callback();
        }, function (message) {
            logger.warn(message);
            process.exit(1);
        });

    });

    gulp.task('isActionAlreadyExist', ['isObjectExist'], function (callback) {
        actionConfig.get(appName, objectName, actionName, null, null, token, auth).then(function (lambdaObject) {
            if (!lambdaObject) {
                logger.warn("The action " + actionName + " does not exist");
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

    gulp.task('deleteAction', ['isActionAlreadyExist'], function(callback){
        actionConfig.delete(appName, lambdaId, null, token, auth).then(function(data){
            console.log("Action '" + actionName +"' was deleted.");
            callback();
        }, function(message){
            logger.warn(message);
            process.exit(1);
        });
    });

    gulp.start('deleteAction');
    
};