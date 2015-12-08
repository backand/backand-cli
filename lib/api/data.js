'use strict';
var net = require('./net');
var tokenStorage = require('./token_storage');
var _ = require('underscore');

module.exports = {
  get: function(appName, tableName, params, headers) {
  	return net.get('/1/table/data/' + tableName, params, _.extend({'AppName': appName}, headers), true, tokenStorage.get(appName));
  },
  post: function(appName, object, params, headers) {
  	return net.post('/1/model', object, params, _.extend({'AppName': appName}, headers), true, tokenStorage.get(appName));
  }
}