'use strict';
var net = require('./net');
var tokenStorage = require('./token_storage');
var _ = require('underscore');

var token = null;
var auth = null;

module.exports = {
  init: function(appName, masterToken, userToken){

    if (!masterToken || !userToken){
      try {
        token = tokenStorage.get(appName);
      }
      catch(err){
        logger.warn('Must run backand signin first');
        process.exit(1);
      }
    }
    auth = masterToken + ':' + userToken;
  },

  get: function(appName, tableName, params, headers, auth) {
  	return net.get('/1/object/data/' + tableName, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  },
  // post: function(appName, object, params, headers, auth) {
  // 	return net.post('/1/object/' + tableName, object, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  // },
  // put: function(appName, object, params, headers, auth) {
  // 	return net.put('/1/object/data/' + tableName, object, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  // },
  // delete: function(appName, object, params, headers, auth) {
  // 	return net.put('/1/object/data/' + tableName, object, params, _.extend({'AppName': appName}, headers), true, !auth ? tokenStorage.get(appName) : null, auth);
  // },

  appCreate: function(data, params, headers) {
    return net.post('/admin/myApps/', data, params, headers, false, token, auth);
  },

  dbCreate: function(appName, data, params, headers) {
    return net.post('/admin/myAppConnection/' + appName, data, params, headers, false, token, auth);
  }

};