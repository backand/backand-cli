"use strict";

var _ = require('underscore');
var logger = require('../../logger');
var general = require('../../api/general');

module.exports = function(appName, object, params, data, headers, token, auth) {

  if (!_.has(params, "id")){
  	logger.warn('Parameters must include id');
    process.exit(1);
  }

  general.remove(appName, object, params, headers, token, auth).then(function(data){
    process.exit(0);
  }, function(err){
    process.exit(1);
  });
}

