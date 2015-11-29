'use strict';
var net = require('./net');
var tokenStorage = require('./token_storage');

module.exports = {
  get: function(appName, tableName, params) {
  	return net.get('/1/table/data/' + tableName, params, {'AppName': appName}, true, tokenStorage.get());
  },
  post: function(appName, object, params) {
  	return net.post('/1/model', object, params, {'AppName': appName}, true, tokenStorage.get());
  }
}