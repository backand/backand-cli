"use strict";
var logger   = require('../logger');

module.exports = {
  getCommand: function(commandName){
    try {
      return require('./' + commandName);
    }
    catch (err){
      logger.warn(err.toString());
      process.exit(1);
    }
  }

};