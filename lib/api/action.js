'use strict';
var net = require('./net');
var tokenStorage = require('./token_storage');
var _ = require('underscore');

module.exports = {
  post: function(appName, data, params, headers, auth) {
  	return net.post('/1/action/config', data, params, _.extend({'AppName': appName}, headers), false, !auth ? tokenStorage.get(appName) : null, auth);
  },
  put: function(appName, object, action, data, params, headers, auth) {
    return net.put('/1/action/config/' + object + '/' + action, data, params, _.extend({'AppName': appName}, headers), false, !auth ? tokenStorage.get(appName) : null, auth);
  },

  get: function(appName, object, action, params, headers, auth) {
    return net.get('/1/action/config/' + object + '/' + action, params, _.extend({'AppName': appName}, headers), false, !auth ? tokenStorage.get(appName) : null, auth);
  },

  exists: function(appName, object, action, params, headers, auth) {
    return net.exists('/1/action/config/' + object + '/' + action, params, _.extend({'AppName': appName}, headers), false, !auth ? tokenStorage.get(appName) : null, auth);
  },
  objectExists: function(appName, object, params, headers, auth) {
    return net.exists('/1/objects/' + object, params, _.extend({'AppName': appName}, headers), false, !auth ? tokenStorage.get(appName) : null, auth);
  },
  appExists: function(appName, params, headers, auth) {
    return net.exists('/admin/myApps/' + appName, params, _.extend({'AppName': appName}, headers), false, !auth ? tokenStorage.get(appName) : null, auth);
  },

  template: function(auth) {
    return net.get('/1/template/nodejs', null, null, false, null, auth);
  }
}