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

  warn: function (message) {
    return this.log('⚠ '.red + message.yellow);
  }
};
