'use strict';
var net = require('./net');

module.exports = {
  signin: function(email, password, appName) {
  	return net.post('/token',
      "grant_type=password" +
      "&username=" + email + 
      "&password=" + password + 
      "&appname=" + appName
    );
  },

  register: function(email, password, fullname) {
  	return net.post('/api/account/signUp',
  		{
        fullName : fullname,
        email : email,
        password : password,
        confirmPassword : password
      }
    );
  },

  signout: function(userToken, masterToken, token) {
    return net.get('/1/user/signout', {}, {}, false, token, masterToken + ':' + userToken);
  }, 

  getUserDetails: function(userToken, masterToken, token) {
    return net.get('/api/account/profile', {}, {}, false, token, masterToken + ':' + userToken);
  }
};