"use strict";

var question = require('readline-sync').question;

var config  = require('../../config');
var data    = require('../../api/general');

module.exports = function (appName, functionName, options, userToken, masterToken, token) {

  // if(!options.name){
  //   logger.log('You\'ll need an app name to create a Backand application. You can supply these as parameters to the' +
  //       ' call:')
  //       .log('backand app create --name myBackandApp\n'.blue)
  //       .log('Or you can complete the wizard below:\n');
  // }

  var paramsValue = {};
  var parameters = options.params || question('Parameters (JSON): '.grey);
  if(parameters){
    paramsValue = JSON.parse(parameters);
  }

  var debug = options.debug || question('Debug (false): '.grey);

  if(debug){
    paramsValue.$$debug$$ = true;
  }

  console.log(parameters);
  var params = {"parameters":JSON.stringify(paramsValue)};
  var category = 'general';

  data.runFunction(appName, category, functionName, params, null, token, options.master + ':' + options.user).then(function(data){
    process.exit(0);
  }, function(err){
    process.exit(1);
  });


};