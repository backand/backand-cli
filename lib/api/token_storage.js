'use strict';
var fs = require('fs');
var logger = require('../logger');

var TOKEN_FILE = '/tmp/.backand'
var token;

if (fs.existsSync(TOKEN_FILE)) {
	token = fs.readFileSync(TOKEN_FILE);
} 

module.exports = {
    set: function(_token) {
    	token = _token;
    	fs.writeFileSync(TOKEN_FILE, _token);
    },
    get: function() {
    	if (!token) {
    		logger.warn("Please login first by running ")
    			.log('backand login'.blue);
    		throw 'token not found';
    	}
    	return token;
    }
};
