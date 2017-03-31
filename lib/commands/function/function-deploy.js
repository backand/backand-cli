"use strict";

var gulp = require('gulp');
var del = require('del');
var fs = require('fs');
var path = require("path");

var logger = require('../../logger');
var config = require('../../config');

var backandSync = require('../../api/backand-sync-s3');
var actionConfig = require('../../api/action');
var generalApi = require('../../api/general');
var zipDirectory = require('./../../api/zip-things').zipDirectory;
var getTimeMSFloat = require('./../../api/time').getTimeMSFloat;

backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;

function createDataObject(action, object, fileName) {
  return {
    "name": action,
    "viewTable": object,
    "dataAction": "OnDemand",
    "actionType": "Function",
    "category": "general",
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

var updateFunctionInBackand = function (appName, rootObject, functionName, fileName, auth, token, callback) {


  var data = createDataObject(functionName, rootObject, fileName);
  return actionConfig.put(appName, rootObject, functionName, data, null, null, token, auth)
      .then(function (reponse) {
            var cloudServiceUrl = config.cloudService.function_url
                .replace("<appName>", appName)
                .replace("<functionId>", reponse.iD);

            logger.log("The function was deployed and can be tested at " + cloudServiceUrl);
            callback();
          },
          function (error) {
            logger.error("The function deployment was failed: ", error);
            callback(error);
          });
};

module.exports = function (appName, functionName, userToken, masterToken, token, folder) {

  logger.log("Deploy function started. Function name: " + functionName + ", app name: " + appName + "\n");

  var rootObject = "_root";
  var destFolder = folder || functionName;


  var zipFile = rootObject + "_" + functionName + '_' + getTimeMSFloat() + '.zip';

  del(['*.zip']);

  var auth = masterToken + ":" + userToken ;

  gulp.task('checkRequiredFiles', function(callback){

    if(!fs.existsSync(destFolder + "/index.js")){
      logger.error("Deploy function failed. The function's code was not found in this folder ('" + destFolder + "')." +
          " Please set the --folder param to be the full path of the function's code.");
      process.exit(1);
    }

    if(!fs.existsSync(destFolder + "/handler.js")){
      logger.error("Deploy function failed. The handler.js file is required in the function's folder ('" + destFolder + "').");
      process.exit(1);
    }
    callback();

  });

  gulp.task('isAppExist', ['checkRequiredFiles'], function (callback) {
    generalApi.appExists(appName, null, null, token, auth)
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

  gulp.task('isFunctionAlreadyExist', ['isAppExist'], function (callback) {
    actionConfig.exists(appName, rootObject, functionName, null, null, token, auth)
        .then(function (exists) {
          if (!exists) {
            logger.warn("The function " + functionName + " does not exist");
            process.exit(1);
          }
          callback();
        }, function (message) {
          logger.warn(message);
          process.exit(1);
        });

  });

  gulp.task('sts', ['isFunctionAlreadyExist'], function () {
    if (token)
      return backandSync.sts(null, null, token, appName);
    else
      return backandSync.sts(masterToken, userToken, null, appName);
  });

  gulp.task('zip', ['sts'], function(callback) {
    return zipDirectory(path.resolve(destFolder), zipFile, callback);
  });

  gulp.task('dist', ['zip'], function () {
    return backandSync.dist(process.cwd(), appName, "nodejs", rootObject + '/' + functionName, process.cwd() + "/" + zipFile);

  });

  gulp.task('updateFunctionInBackand', ['dist'], function (callback) {
    updateFunctionInBackand(appName, rootObject, functionName, zipFile, auth, token, callback);
  });

  gulp.task('clean', ['updateFunctionInBackand'], function(callback){
    var absolutePath = path.resolve(destFolder);
    console.log("Function code was deployed from folder: " + absolutePath);
    return del(['*.zip']);
  });

  gulp.start('clean');

};