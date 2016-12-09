"use strict";
var fs = require('fs-extra');

var logger = require('../../logger');
var config = require('../../config');
var downloader = require('../../api/downloader');
var actionConfig = require('../../api/action');
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');
var del = require('del');
backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;
var tokenStorage = require('../../api/token_storage');
var zipDirectory = require('./zip-things').zipDirectory; 
var getTimeMSFloat = require('./time').getTimeMSFloat;

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

var createActionFolder = function (object, action) {
    var rootFolder = object + '/' + action;
    if (isDirectoryExists(rootFolder)) {
        logger.warn('The action directory "' + rootFolder + '" already exists. Either delete the directory or create the action with a different name.');
        process.exit(1);
    }

    fs.mkdirsSync(rootFolder);
};

var isDirectoryExists = function (path) {
    try {
        return fs.statSync(path).isDirectory();
    }
    catch (err) {
        return false;
    }
};

function createrActionDataObject(action, object) {
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
        "fileName": action + ".zip",
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
var createActionInBackand = function (appName, object, action, userToken, masterToken, token, callback) {

    var data = createrActionDataObject(action, object);
    return actionConfig.post(appName, data, null, null, token ? token : masterToken + ":" + userToken)
        .then(function (reponse) {
            var cloudServiceUrl = config.cloudService.action_url
                .replace("<appName>", appName)
                .replace("<objectId>", reponse.viewTable);

            logger.log("The action was deployed and can be tested at " + cloudServiceUrl);
            callback();
        },
        function (error) {
            logger.warn("The action creation was failed: ", error);
            callback(error);
        });
};

module.exports = function (appName, objectName, actionName, userToken, masterToken, token, folder) {

    logger.log("Init action started. action name: " + actionName + ", object name: " + objectName + ", app name: " + appName + "\n");
    var rootFolder = objectName + '/' + actionName;

    var destFolder = objectName + '/' + actionName;
    var sourceFolder = process.cwd() + '/' + destFolder;
    var zipFile = actionName + getTimeMSFloat() + '.zip';

    del.sync(['*.zip']);
    
    var auth = masterToken + ':' + userToken;
    

    gulp.task('isAppExist', function (callback) {
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
        createActionFolder(objectName, actionName);
        callback();
    });

    gulp.task('downloadAndSaveAs', ['createActionFolder'], function (callback) {
        actionConfig.template(token, auth).then(function (result) {
            downloader.downloadAndSaveAs(result.url, rootFolder + "/template.zip",
                rootFolder, function(){
                    zipDirectory(sourceFolder, zipFile, callback);
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
        return backandSync.dist(process.cwd(), appName, "nodejs", destFolder.replace("\\", "/"), zipFile);
    });

    gulp.task('createActionInBackand', ['dist'], function (callback) {
        createActionInBackand(appName, objectName, actionName, userToken, masterToken, token, callback);
    });

    gulp.start('createActionInBackand');
};