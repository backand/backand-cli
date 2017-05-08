'use strict';

// production:
var config =  require('../config');
var http = require(config.backand.protocol);
var BASE_URL = config.backand.host;
var BASE_PORT = config.backand.port;

var Q = require('q');
var logger = require('../logger');
var url = require('url');
var merge = require('merge');


function logRequest(request) {
	logger
		.newline().log(request.method)
		.log('url: ' + (BASE_URL + request.path).yellow);
		if (request.data) {
			logger.log('data: ' + beautify(request.data).yellow);
		}
		if (request.headers) {
			logger.log('headers: ' + beautify(request.headers).yellow);
		}
		logger.newline();
}
function beautify(json) {
	if (typeof(json) === 'string') {
		try {
			json = JSON.parse(json);
		} catch(e) {}
	}
	try {
		json = JSON.stringify(json, null, 4);
	} catch(e) {}
	return json;
}
function logResponse(response, body) {
  logger.log('responseCode: ' + response.statusCode.toString().yellow);
  logger.log('responseBody: ' + beautify(body).blue).newline();	
}

module.exports = {

	request: function(options, echo) {
		options = merge(options, {host: BASE_URL, port: BASE_PORT});
		options.headers = options.headers || {};
		if (options.accessToken) {
			options.headers['Authorization'] = 'bearer ' + options.accessToken;
		}
		
		if (options.data) {
			options.headers['Content-Length'] = options.data.length;
			options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}
		if (echo) {
			logRequest(options);
		}

		var deferred = Q.defer();
		var req = http.request(options, function(response) {
			var body = '';
			response.on('data', function(chunk) {
				body += chunk;
			});
			response.on('end', function() {
				if (echo) {
					logResponse(response, body);
			  }
				if (response.statusCode > 299) {
          var obj = null;
          try{ //the error is not JSON all the time
            obj = JSON.parse(body);
          } catch(e){}

				  if(obj && obj.error_description){
            logger.warn(beautify(obj.error_description));
          } else {
            logger.warn(beautify(body));
          }
					deferred.reject(beautify(body));
          return;
				}
				if (body == '') {
          deferred.resolve(body);
				} else {
          try {
            var data = JSON.parse(body);
            if (data.error_description || data.error) {
              logger.warn(data.error_description || data.error);
              deferred.reject(data);
              return;
            }
            deferred.resolve(data);
          } catch (e) {
            logger.warn('Could not parse response as JSON').log(body.blue);
            deferred.reject(beautify(body));
            return;
          }
        }
			});
		}).on('error', function(error) {
      logger.warn(error.message);
      deferred.reject(error.message);
      return;
		});
		if (options.data) {
			req.write(options.data);
		}
		req.end();
		return deferred.promise;
	},

	requestExist: function(options, echo) {
		options = merge(options, {host: BASE_URL, port: BASE_PORT});
		options.headers = options.headers || {};
		if (options.accessToken) {
			options.headers['Authorization'] = 'bearer ' + options.accessToken;
		}
		
		if (echo) {
			logRequest(options);
		}

		var deferred = Q.defer();
		var req = http.request(options, function(response) {
			var body = '';
			response.on('data', function(chunk) {
				body += chunk;
			});
			response.on('end', function() {
				if (echo) {
					logResponse(response, body);
				}
				var exists = response.statusCode == 200;
				var notExists = response.statusCode == 404;
				var error = !exists && !notExists;

				if (error){
					logger.warn(beautify(body));
					deferred.reject(beautify(body));
					return;
				}

				deferred.resolve(exists);
			});
		}).on('error', function(error) {
      logger.warn(error.message);
			deferred.reject(error.message);
		});
		if (options.data) {
			req.write(options.data);
		}
		req.end();
		return deferred.promise;
	},

	exists: function(path, params, headers, echo, accessToken, auth) {
		path = url.format({pathname: path, query: params});
		return this.requestExist({method: 'GET', path: path, headers: headers, accessToken: accessToken, auth: auth}, echo);
	},

	get: function(path, params, headers, echo, accessToken, auth) {
		path = url.format({pathname: path, query: params});
		return this.request({method: 'GET', path: path, headers: headers, accessToken: accessToken, auth: auth}, echo);
	},

    post: function(path, data, params, headers, echo, accessToken, auth) {
		if (typeof(data) === 'object') {
			data = JSON.stringify(data);
		}
		path = url.format({pathname: path, query: params});
		return this.request({method: 'POST', path: path, headers: headers, data: data, accessToken: accessToken, auth: auth}, echo);
	},

	put: function(path, data, params, headers, echo, accessToken, auth) {
		if (typeof(data) === 'object') {
			data = JSON.stringify(data);
		}
		path = url.format({pathname: path, query: params});
		return this.request({method: 'put', path: path, headers: headers, data: data, accessToken: accessToken, auth: auth}, echo);
	},

	delete: function(path, params, headers, echo, accessToken, auth) {
		path = url.format({pathname: path, query: params});
		return this.request({method: 'DELETE', path: path, headers: headers, accessToken: accessToken, auth: auth}, echo);
	},
	
};
