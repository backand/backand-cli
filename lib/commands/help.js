"use strict";

module.exports = function () {
  var term = process.argv[3];

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
  default:
      console.log('Available commands:'.grey);
      console.log('   help       ' + 'h      ' + '                  ' + 'This command');
      console.log('   register   ' + 'r      ' + '                  ' + 'Registers an account in Backand Cloud Services');
      console.log('   login      ' + 'l      ' + '                  ' + 'Signs in to Backand Cloud Services');
      console.log('   get        ' + 'g      ' + '                  ' + 'Gets data from a specific app & table');
      console.log('   sync        ' + 's      ' + '                  ' + 'Syncs a local folder to your app web site');
      console.log('Run '+ 'help [command]'.blue + ' for more information');
  }
};