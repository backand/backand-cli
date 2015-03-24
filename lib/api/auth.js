'use strict';
var net = require('./net');

module.exports = {
  signin: function(email, password) {
  	return net.post('/token',
      "grant_type=password" +
      "&username=" + email + 
      "&password=" + password + 
      "&appname=www"
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