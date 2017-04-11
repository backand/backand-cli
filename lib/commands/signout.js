"use strict";

var logger = require('../logger');
var fs = require('fs');

module.exports = function (options) {

    var temporaryCredentialsFile = './.backand-credentials.json';

    fs.unlink(temporaryCredentialsFile, function(err){
        if (err){
            logger.warn(JSON.stringify(err));
        }
        process.exit(1);
    });
};

