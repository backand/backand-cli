"use strict";

var logger = require('../../logger');
var general = require('../../api/general');

module.exports = function(appName, object, params, data, headers, token, auth) {
  general.getList(appName, object, params, headers, token, auth).then(function(data){
    process.exit(0);
  }, function(err){
    process.exit(1);
  });
}

