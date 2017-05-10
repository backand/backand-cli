"use strict";

var logger = require('../logger');
var auth = require('../api/auth');
var tokenStorage  = require('../api/token-storage');
var fs = require('fs');


module.exports = function (options) {

	var appName = options.app;//Get latest app name, don't get it from user any more || question('App Name: '.grey);
	if(!appName){
	    appName = tokenStorage.getCurrentApp();
	}

	var masterToken = options.master;
    var userToken = options.user;

    var token = null;
    if (!options.master || !options.user){
        try {
            token = tokenStorage.get(appName);  
        }
        catch(err){
            logger.warn('Must login first');
            process.exit(1);
        }
    }

	auth.signout(userToken, masterToken, token).then(
		
		function(data) {		
			var temporaryCredentialsFile = './.backand-credentials.json';
		    fs.unlink(temporaryCredentialsFile, function(err){
		        if (err){
		            logger.warn(JSON.stringify(err));
		            process.exit(1);
		        }
		        else{
					logger.success("Signed out successfully");
	    			process.exit(0);
		        }	        
		    });	    	
		}, 

		function(err){
			logger.error("Unable to sign out");
	    	process.exit(1);
	  	}

	);    
};

