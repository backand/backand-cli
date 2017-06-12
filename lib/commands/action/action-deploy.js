"use strict";

var gulp = require('gulp');
var del = require('del');
var fs = require('fs');
var path = require("path");
var git = require('git-state');
var _ = require('underscore');

var logger = require('../../logger');
var config = require('../../config');

var actionConfig = require('../../api/action');
var generalApi = require('../../api/general');
var backandSync = require('../../api/backand-sync-s3');
var zipDirectory = require('./../../api/zip-things').zipDirectory;
var getTimeMSFloat = require('./../../api/time').getTimeMSFloat;

backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;

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
        "fileName": fileName
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

    gulp.task('isObjectExist', ['isAppExist'], function (callback) {
        generalApi.objectExists(appName, objectName, null, null, token, auth)
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

    gulp.task('git status', ['isActionAlreadyExist'], function(callback){

        git.isGit(destFolder, function (exists) {
          if (!exists) {
            callback();
          }
          else{
            git.check(destFolder, function (err, result) {
                if (err) {
                    logger.warn('Damaged git repo status in: ' + destFolder + ',  aborting');
                    process.exit(1);
                }
                else{
                    // console.log(result) 
                    // => { branch: 'master', 
                    //      ahead: 0, 
                    //      dirty: 9, 
                    //      untracked: 1, 
                    //      stashes: 0 } 
                    var changes = _.reduce(
                        _.filter(
                            _.values(result), (v) => { return v; }
                        ),
                        (memo, num) => { return memo + num; }, 0
                    );
                    if (changes > 0){ 
                        logger.warn('Git repo has uncommited changes: ' + destFolder + ',  aborting');
                        process.exit(1);
                    }
                    else{
                        callback();
                    }
                }
                
            })
          }
        });

    });


    gulp.task('sts', ['git status'], function () {
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
        var absolutePath = path.resolve(destFolder);
        console.log("Action source code was deployed from folder: " + absolutePath);
        return del(['*.zip']);
    });

    gulp.start('clean');

};