"use strict";

var logger     = require('../logger');
var auth			 = require('../api/auth');
var tokenStore = require('../api/token_storage');
var http       = require('fs');
var prompt     = require('readline-sync').question;

module.exports = function () {
  var username = prompt('Username'.white);
  var password = prompt('Password'.white);

	
};
