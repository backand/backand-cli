"use strict";
var logger = require('../../logger');
var config = require('../../config');
var actionConfig = require('../../api/action');
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');
var zipDirectory = require('./zip-things').zipDirectory; 
var del = require('del');
var fs = require('fs');
var getTimeMSFloat = require('./time').getTimeMSFloat;
var path = require("path");


backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;
var tokenStorage = require('../../api/token_storage');

function createDataObject(action, object, fileName) {
    return {
        "name": action,
        "viewTable": object,
        "dataAction": "OnDemand",
        "additionalView": "",
        "workflowAction": "NodeJS",
        "databaseViewName": "",
        "inputParameters": "",
        "useSqlParser": false,
        "whereCondition": "true",
        "to": "",
        "cc": "",
        "bcc": "",
        "from": "",
        "subject": "",
        "notifyMessage": "",
        "code": "",
        "command": "",
        "fileName": fileName,
        "functionName": "",
        "executeMessage": "",
        "inparameters": "",
        "outParameters": "",
        "validateCommand1": "",
        "validateMessage1": "",
        "validateCommand2": "",
        "validateMessage2": "",
        "validateCommand3": "",
        "validateMessage3": "",
        "validateCommand4": "",
        "validateMessage4": "",
        "webServiceUrl": "",
        "parameter": []
    };
}
function trim(str, char){
    if (str.charAt(0) == char) str = str.substr(1);
    if (str.charAt(str.length - 1) == char) str = str.substr(0, str.length - 1);
    return str;
}

var updateActionInBackand = function (appName, object, action, fileName, auth, token, callback) {


    var data = createDataObject(action, object, fileName);
    return actionConfig.put(appName, object, action, data, null, null, token, auth)
        .then(function (reponse) {
                var cloudServiceUrl = config.cloudService.action_url
                    .replace("<appName>", appName)
                    .replace("<objectId>", reponse.viewTable)
                    .replace("<actionId>", reponse.iD);

              logger.log("The action was deployed and can be tested at " + cloudServiceUrl);
                callback();
            },
            function (error) {
                logger.error("The action deployment was failed: ", error);
                callback(error);
            });
};

module.exports = function (appName, objectName, actionName, userToken, masterToken, token, folder) {

    logger.log("Deploy action started. action name: " + actionName + ", object name: " + objectName + ", app name: " + appName + "\n");

    var destFolder = folder || objectName + '/' + actionName;


  var zipFile = actionName + '_' + getTimeMSFloat() + '.zip';

    del(['*.zip']);

    var auth = masterToken + ":" + userToken ;

    gulp.task('checkRequiredFiles', function(callback){

      if(!fs.existsSync(destFolder + "/index.js")){
        logger.error("Deploy action failed. The action's code was not found in this folder ('" + destFolder + "')." +
            " Please set the --folder param to be the full path of the action's code.");
        process.exit(1);
      }

      if(!fs.existsSync(destFolder + "/handler.js")){
        logger.error("Deploy action failed. The handler.js file is required in the action's folder ('" + destFolder + "').");
        process.exit(1);
      }
      callback();

    });

    gulp.task('isAppExist', ['checkRequiredFiles'], function (callback) {
        actionConfig.appExists(appName, null, null, token, auth)
            .then(function (exists) {
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
        actionConfig.objectExists(appName, objectName, null, null, token, auth)
            .then(function (exists) {
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
        actionConfig.exists(appName, objectName, actionName, null, null, token, auth)
            .then(function (exists) {
                if (!exists) {
                    logger.warn("The action " + actionName + " does not exist");
                    process.exit(1);
                }
                callback();
            }, function (message) {
                logger.warn(message);
                process.exit(1);
            });

    });

    gulp.task('sts', ['isActionAlreadyExist'], function () {
        if (token)
            return backandSync.sts(null, null, token, appName);
        else
            return backandSync.sts(masterToken, userToken, null, appName);
    });

    gulp.task('zip', ['sts'], function(callback) {
        return zipDirectory(path.resolve(destFolder), zipFile, callback);
    });

    gulp.task('dist', ['zip'], function () {
        return backandSync.dist(process.cwd(), appName, "nodejs", objectName + '/' + actionName, process.cwd() + "/" + zipFile);

    });
   
    gulp.task('updateActionInBackand', ['dist'], function (callback) {
        updateActionInBackand(appName, objectName, actionName, zipFile, auth, token, callback);
    });

    gulp.task('clean', ['updateActionInBackand'], function(callback){
        return del(['*.zip']);
    });

    gulp.start('clean');

};