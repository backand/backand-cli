"use strict";
var fs = require('fs-extra');
var path = require("path");
var gulp = require('gulp');
var del = require('del');

var logger = require('../../logger');
var config = require('../../config');

var backandSync = require('../../api/backand-sync-s3');
var downloader = require('../../api/downloader');
var actionConfig = require('../../api/action');
var generalApi = require('../../api/general');
var zipDirectory = require('./../../api/zip-things').zipDirectory;
var getTimeMSFloat = require('./../../api/time').getTimeMSFloat;

backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;

var createFunctionFolder = function (destFolder) {
  if (isDirectoryExists(destFolder)) {
    logger.warn('The function directory "' + destFolder + '" already exists. Either delete the directory or' +
        ' create' +
        ' the action with a different name.');
    process.exit(1);
  }

  fs.mkdirsSync(destFolder);
};

var isDirectoryExists = function (path) {
  try {
    return fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
};

function createrFunctionDataObject(action, object, zipFileName) {
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
    "fileName": zipFileName,
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
var createFunctionInBackand = function (appName, rootObject, functionName, auth, token, zipFileName, callback) {

  var data = createrFunctionDataObject(functionName, rootObject, zipFileName);
  return actionConfig.post(appName, data, null, null, token, auth)
      .then(function (reponse) {
            var cloudServiceUrl = config.cloudService.function_url
                .replace("<appName>", appName)
                .replace("<functionId>", reponse.__metadata.id);

            logger.log("The function was deployed and can be tested at " + cloudServiceUrl);
            callback();
          },
          function (error) {
            logger.warn("The function creation was failed: ", error);
            callback(error);
          });
};

module.exports = function (appName, functionName, userToken, masterToken, token, folder, template) {

  logger.log("Init function started. Function name: " + functionName + ", app name: " + appName + "\n");

  var rootObject = "_root";
  var destFolder = folder || functionName;
  var zipFile = rootObject + "_" + functionName + '_' + getTimeMSFloat() + '.zip';

  del.sync(['*.zip']);

  var auth = masterToken + ':' + userToken;

  gulp.task('isAppExist', function (callback) {
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
    actionConfig.exists(appName, rootObject, functionName, null, null, token, auth).then(function (exists) {
      if (exists) {
        logger.warn("The function " + functionName + " already exists");
        process.exit(1);
      }
      callback();
    }, function (message) {
      logger.warn(message);
      process.exit(1);
    });
  });

  gulp.task('createFunctionFolder', ['isFunctionAlreadyExist'], function (callback) {
    createFunctionFolder(destFolder);
    callback();
  });

  gulp.task('downloadAndSaveAs', ['createFunctionFolder'], function (callback) {
    generalApi.template(template, token, auth).then(function (result) {
      downloader.downloadAndSaveAs(result.url, destFolder + "/" + template + ".zip",
          destFolder, function(){
            zipDirectory(path.resolve(destFolder), zipFile, callback);
          });
    }, function (message) {
      logger.warn(message);
      process.exit(1);
    });
  });

  gulp.task('sts', ['downloadAndSaveAs'], function () {
    if (token)
      return backandSync.sts(null, null, token, appName);
    else
      return backandSync.sts(masterToken, userToken, null, appName);
  });

  gulp.task('dist', ['sts'], function () {
    return backandSync.dist(process.cwd(), appName, "nodejs", rootObject + '/' + functionName, process.cwd() + "/" + zipFile);
  });

  gulp.task('createFunctionInBackand', ['dist'], function (callback) {
    createFunctionInBackand(appName, rootObject, functionName, auth, token, zipFile, callback);
  });

  gulp.task('clean', ['createFunctionInBackand'], function(callback){
    return del(['*.zip']);
  });

  gulp.task('notify', ['clean'], function(callback){
    var absolutePath = path.resolve(destFolder);
    console.log("Function source code is in folder: " + absolutePath);
    callback();
  });

  gulp.start('notify');

};