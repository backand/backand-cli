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
  }
}