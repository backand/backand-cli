"use strict";
var logger   = require('../logger');

module.exports = {
  getCommand: function(commandName){
    try {
      return require('./' + commandName);
    }
    catch (err){
      logger.warn("Could not find command " + commandName)
      process.exit(1);
    }
  }

};