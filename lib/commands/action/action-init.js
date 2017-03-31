"use strict";
var fs = require('fs-extra');
var gulp = require('gulp');
var del = require('del');
var path = require("path");

var logger = require('../../logger');
var config = require('../../config');

var downloader = require('../../api/downloader');
var actionConfig = require('../../api/action');
var generalApi = require('../../api/general');
var backandSync = require('../../api/backand-sync-s3');
var zipDirectory = require('./../../api/zip-things').zipDirectory;
var getTimeMSFloat = require('./../../api/time').getTimeMSFloat;

backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;

var createActionFolder = function (destFolder) {
    if (isDirectoryExists(destFolder)) {
        logger.warn('The action directory "' + destFolder + '" already exists. Either delete the directory or create the action with a different name.');
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

function createrActionDataObject(action, object, zipFileName) {
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
var createActionInBackand = function (appName, object, action, auth, token, zipFileName, callback) {

    var data = createrActionDataObject(action, object, zipFileName);
    return actionConfig.post(appName, data, null, null, token, auth)
        .then(function (reponse) {
            var cloudServiceUrl = config.cloudService.action_url
                .replace("<appName>", appName)
                .replace("<objectId>", reponse.viewTable)
                .replace("<actionId>", reponse.__metadata.id);

            logger.log("The action was deployed and can be tested at " + cloudServiceUrl);
            callback();
        },
        function (error) {
            logger.warn("The action creation was failed: ", error);
            callback(error);
        });
};

module.exports = function (appName, objectName, actionName, userToken, masterToken, token, folder, template) {

    logger.log("Init action started. action name: " + actionName + ", object name: " + objectName + ", app name: " + appName + "\n");

    var destFolder = folder || objectName + '/' + actionName;
    var zipFile = actionName + '_' + getTimeMSFloat() + '.zip';

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
        actionConfig.exists(appName, objectName, actionName, null, null, token, auth).then(function (exists) {
            if (exists) {
                logger.warn("The action " + actionName + " already exists");
                process.exit(1);
            }
            callback();
        }, function (message) {
            logger.warn(message);
            process.exit(1);
        });
    });

    gulp.task('createActionFolder', ['isActionAlreadyExist'], function (callback) {
        createActionFolder(destFolder);
        callback();
    });

    gulp.task('downloadAndSaveAs', ['createActionFolder'], function (callback) {
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
        return backandSync.dist(process.cwd(), appName, "nodejs", objectName + '/' + actionName, process.cwd() + "/" + zipFile);
    });

    gulp.task('createActionInBackand', ['dist'], function (callback) {
        createActionInBackand(appName, objectName, actionName, auth, token, zipFile, callback);
    });

    gulp.task('clean', ['createActionInBackand'], function(callback){
        return del(['*.zip']);
    });

    gulp.task('notify', ['clean'], function(callback){
        var absolutePath = path.resolve(destFolder);
        console.log("Action source code is in folder: " + absolutePath);
        callback();
    });

    gulp.start('notify');
    
};