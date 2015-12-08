'use strict';
var fs = require('fs');
var logger = require('../logger');

var TOKEN_FILE = './.backand-credentials.json'
var credentials;

function readCredentialsFile(){
    if (fs.existsSync(TOKEN_FILE)) {
        credentials = JSON.parse(fs.readFileSync(TOKEN_FILE));
    }
    else{
        credentials = {};
    } 
}

readCredentialsFile();

module.exports = {
    set: function(_appName, _token) {
        if (credentials[_appName]){
            credentials[_appName].token = _token;
        }
        else{
           credentials[_appName] = { token: _token }; 
        }
    	fs.writeFileSync(TOKEN_FILE, JSON.stringify(credentials));
    },
    get: function(_appName) {
    	if (credentials && credentials[_appName] && credentials[_appName].token) {
            return credentials[_appName].token;
    	}
    	logger.warn("Please login first by running ")
            .log('backand login'.blue);
        throw 'token not found';
    }
};
