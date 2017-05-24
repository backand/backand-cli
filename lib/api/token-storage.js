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
    set: function(_appName, username, _token) {
        if (credentials[_appName]){
            credentials[_appName].token = _token;
        }
        else{
           credentials[_appName] = { token: _token };
        }
        //save the last app user sign into
      credentials.currentApp = _appName;
      credentials.currentUsername = username;

      //save the file with the updated credentials
    	fs.writeFileSync(TOKEN_FILE, JSON.stringify(credentials));
    },
    get: function(_appName) {
    	if (credentials && credentials[_appName] && credentials[_appName].token) {
            return credentials[_appName].token;
    	}
    	logger.warn("Please login first by running ")
            .log('backand signin'.blue);
        throw 'token not found';
    },
    getCurrentApp: function(){
      return credentials.currentApp;
    },
    getCurrentUsername: function(){
      return credentials.currentUsername;
    }
};
