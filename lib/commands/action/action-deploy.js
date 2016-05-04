"use strict";
var logger = require('../../logger');
var config = require('../../config');
var actionConfig = require('../../api/action');
var gulp = require('gulp');
var backandSync = require('backand-hosting-s3');
backandSync.config.sts_url = config.backand.protocol + "://" + config.backand.host + ":" + config.backand.port;
var tokenStorage = require('../../api/token_storage');

function createDataObject(action, object) {
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
function trim(str, char){
    if (str.charAt(0) == char) str = str.substr(1);
    if (str.charAt(str.length - 1) == char) str = str.substr(0, str.length - 1);
    return str;
}
var updateActionInBackand = function (appName, object, action, userToken, masterToken, callback) {
    var data = createDataObject(action, object);
    return actionConfig.put(appName, object, action, data, null, null, masterToken + ":" + userToken)
        .then(function (reponse) {
                var cloudServiceUrl = config.cloudService.action_url
                    .replace("<appName>", appName)
                    .replace("<objectId>", reponse.viewTable);

                logger.log("The action was deployed and can be tested at " + cloudServiceUrl);
                callback();
            },
            function (error) {
                logger.error("The action deployment was failed: ", error);
                callback(error);
            });
};

module.exports = function (appName, objectName, actionName, userToken, masterToken, folder) {

    logger.log("Deploy action started. action name: " + actionName + ", object name: " + objectName + ", app name: " + appName + "\n");

    var sourceFolder = process.cwd();
    if (folder)
        sourceFolder = trim(folder, "/"); // objectName + '/' + actionName;

    if (!userToken || !masterToken) {
        try {
            var token = tokenStorage.get(appName);
        }
        catch (err) {
            logger.warn('Must login first');
            return
        }
    }

    gulp.task('isAppExist', function (callback) {
        actionConfig.appExists(appName, null, null, masterToken + ":" + userToken)
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
        actionConfig.objectExists(appName, objectName, null, null, masterToken + ":" + userToken)
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
        actionConfig.exists(appName, objectName, actionName, null, null, masterToken + ":" + userToken)
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

    gulp.task('dist', ['sts'], function () {
        return backandSync.dist(sourceFolder, appName, "nodejs", destFolder.replace("\\", "/"))
    });

    gulp.task('updateActionInBackand', ['dist'], function (callback) {
        updateActionInBackand(appName, objectName, actionName, userToken, masterToken, callback);
    });

    gulp.start('updateActionInBackand');
};