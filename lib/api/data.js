'use strict';
var net = require('./net');
var tokenStorage = require('./token_storage');
var _ = require('underscore');

module.exports = {
  get: function(appName, tableName, params, headers, auth) {
  	return net.get('/1/object/data/' + tableName, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  },
  post: function(appName, object, params, headers, auth) {
  	return net.post('/1/object/' + tableName, object, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  },
  put: function(appName, object, params, headers, auth) {
  	return net.put('/1/object/data/' + tableName, object, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  },
  delete: function(appName, object, params, headers, auth) {
  	return net.put('/1/object/data/' + tableName, object, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  },
  create: function(appName, object, params, headers, auth) {
  	return net.post('/1/model', object, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  }
}