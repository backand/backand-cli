'use strict';
var net = require('./net');

module.exports = {
  signin: function(username, password) {
  	return net.post('/token',
      "grant_type=password" +
      "&username=" + username + 
      "&password=" + password + 
      "&appname=www"
    );
  }
}