'use strict';
var net = require('./net');
var _ = require('underscore');

module.exports = {
  post: function(appName, data, params, headers, token, auth) {
  	return net.post('/1/action/config', data, params, _.extend({'AppName': appName}, headers), false, token, auth);
  },
  put: function(appName, object, action, data, params, headers, token, auth) {
    return net.put('/1/action/config/' + object + '/' + action, data, params, _.extend({'AppName': appName}, headers), false, token, auth);
  },

  get: function(appName, object, action, params, headers, token, auth) {
    return net.get('/1/action/config/' + object + '/' + action, params, _.extend({'AppName': appName}, headers), false, token, auth);
  },

  exists: function(appName, object, action, params, headers, token, auth) {
    return net.exists('/1/action/config/' + object + '/' + action, params, _.extend({'AppName': appName}, headers), false, token, auth);
  },

  delete: function(appName, actionId, headers, token, auth){
    return net.delete('/1/businessRule/' + actionId, null, _.extend({'AppName': appName}, headers), false, token, auth);
  }
};