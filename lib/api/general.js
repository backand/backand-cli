'use strict';
var net = require('./net');
var tokenStorage = require('./token-storage');
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

  getOne: function(appName, object, params, headers, token, auth) {
  	return net.get('/1/objects/' + object, params, _.extend({'AppName': appName}, headers), true, token, auth);

  },

  create: function(appName, object, params, data, headers, token, auth) {
    return net.post('/1/objects/' + object, data, params, _.extend({'AppName': appName}, headers), true, token, auth);

  },

  update: function(appName, object, params, data, headers, token, auth) {
    return net.put('/1/objects/' + object, data, params, _.extend({'AppName': appName}, headers), true, token, auth);

  },

  remove: function(appName, object, params, headers, token, auth) {
    return net.delete('/1/objects/' + object, params, _.extend({'AppName': appName}, headers), true, token, auth);

  },

  getList: function(appName, object, params, headers, token, auth) {
    return net.get('/1/objects/' + object, params, _.extend({'AppName': appName}, headers), true, token, auth);

  },

  runFunction: function(appName, category, name, params, headers, token, auth) {
  	return net.get('/1/function/' + category + '/' + name, params, _.extend({'AppName': appName}, headers), true, token, auth);

  },

  runAction: function(appName, object, action, params, headers, token, auth) {
    return net.get('/1/objects/action/' + object, _.extend(params, { name: action }), _.extend({'AppName': appName}, headers), true, token, auth);
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
  },

  objectExists: function(appName, object, params, headers, token, auth) {
    return net.exists('/1/objects/' + object, params, _.extend({'AppName': appName}, headers), false, token, auth);
  },
  appExists: function(appName, params, headers, token, auth) {
    return net.exists('/admin/myApps/' + appName, params, _.extend({'AppName': appName}, headers), false, token, auth);
  },

  template: function(template, token, auth) {
    return net.get('/1/template/nodejs', { template: template }, null, false, token, auth);
  },

  viewConfig: function(appName, name, params, headers, token, auth) {
    return net.exists('/1/view/config/' + name, params, _.extend({'AppName': appName}, headers), false, token, auth);
  }
};