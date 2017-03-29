"use strict";
var fs = require('fs-extra');

var logger = require('../../logger');
var config = require('../../config');
var actionConfig = require('../../api/action');
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');
var del = require('del');
backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;
var tokenStorage = require('../../api/token_storage');


module.exports = function (appName, objectName, actionName, userToken, masterToken, token, folder) {

    logger.log("Delete action started. action name: " + actionName + ", object name: " + objectName + ", app name: " + appName + "\n");

    var rootFolder = objectName + '/' + actionName;

    var destFolder = objectName + '/' + actionName;
    var sourceFolder = process.cwd() + '/' + destFolder;



    var auth = masterToken + ':' + userToken;

    var lambdaId = null;

    gulp.task('clean', function(callback){
        return del(['*.zip']);
    });
    
    gulp.task('isAppExist', ['clean'], function (callback) {
        actionConfig.appExists(appName, null, null, token, auth).then(function (exists) {
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
        actionConfig.objectExists(appName, objectName, null, null, token, auth).then(function (exists) {
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
            callback();
        }, function(message){
            logger.warn(message);
            process.exit(1);
        });
    });

    gulp.start('deleteAction');
    
};