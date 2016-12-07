"use strict";

module.exports = {
  log: function(message) {
    console.log(message);
    return this;
  },

  newline: function() {
    return this.log("\n");
  },

  success: function (message) {
    return this.log('✔ '.green + message.green);
  },

  error: function (message) {
    return this.log('✔ '.red + message.red);
  },

  warn: function (message) {
    return this.log('⚠ '.yellow + message.yellow);
  }
};
