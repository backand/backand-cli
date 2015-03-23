'use strict';
var net = require('./net');
var token = require('./token_storage').get();

module.exports = {
  get: function(appName, tableName, params) {
  	return net.get('/1/table/data/' + tableName, params, {'AppName': appName}, true, token);
  }
}