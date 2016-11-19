"use strict";

module.exports = function () {
  var term = process.argv[3];

  var pjson = require('../../package.json');
  console.log("Backand version:" + pjson.version);

  switch (term) {
    case 'help':
    case 'h':
      console.log('Usage: ' + 'backand (h)elp'.blue);
      console.log('Displays this help screen');
      break;
    case 'register':
    case 'r':
      console.log('Usage: ' + 'backand (r)egister'.blue);
      console.log('Registers an account in Backand Cloud Services');
      break;
    case 'login':
    case 'l':
      console.log('Usage: ' + 'backand (l)ogin'.blue);
      console.log('Logins to Backand Cloud Services');
      break;
    case 'get':
    case 'g':
      console.log('Usage: ' + 'backand (g)et'.blue + ' <appName> <tableName>');
      console.log('Gets data from a specific app & table');
      break;
    case 'action init':
    case 'ai':
      console.log('Usage: ' + 'backand (a)ction (i)nit'.blue);
      console.log('Initiate a node.js action in your local folder');
      break;
    case 'action deploy':
    case 'ad':
      console.log('Usage: ' + 'backand (a)ction (d)ploy'.blue);
      console.log('Deploy your local node.js action into Backand Cloud Services');
      break;
    default:
      console.log('Available commands:'.grey);
      console.log('   help          ' + 'h      ' + '                ' + 'This command');
      console.log('   register      ' + 'r      ' + '                ' + 'Registers an account in Backand Cloud Services');
      console.log('   login         ' + 'l      ' + '                ' + 'Signs into Backand Cloud Services');
      console.log('   get           ' + 'g      ' + '                ' + 'Gets data from a specific app & table');
      console.log('   sync          ' + 's      ' + '                ' + 'Syncs a local folder to your app web site');
      console.log('   action init   ' + 'ai     ' + '                ' + 'Initiate a node.js action in your local folder');
      console.log('   action deploy ' + 'ad     ' + '                ' + 'Deploy your local node.js action into Backand Cloud Services');
      console.log('Run '+ 'help [command]'.blue + ' for more information');
  }
};