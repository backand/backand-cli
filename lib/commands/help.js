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
    case 'signup':
    case 'u':
      console.log('Usage: ' + 'backand sign(u)p'.blue);
      console.log('Signup to Backand service and create first app');
      break;
    case 'signin':
    case 'i':
      console.log('Usage: ' + 'backand sign(i)n'.blue);
      console.log('Signin to Backand app');
      break;
    case 'signout':
    case 'o':
      console.log('Usage: ' + 'backand sign(o)ut'.blue);
      console.log('Signout from Backand');
      break;
    case 'get':
    case 'g':
      console.log('Usage: ' + 'backand (g)et'.blue + ' <appName> <tableName>');
      console.log('Gets data from a specific object');
      break;
    case 'action init':
    case 'ai':
      console.log('Usage: ' + 'backand (a)ction (i)nit'.blue);
      console.log('Initiate a Lambda node.js action in your local folder');
      break;
    case 'action deploy':
    case 'ad':
      console.log('Usage: ' + 'backand (a)ction (d)ploy'.blue);
      console.log('Deploy your local Lambda node.js action into Backand Lambda Services');
      break;
    case 'action delete':
    case 'ae':
      console.log('Usage: ' + 'backand (a)ction d(e)lete'.blue);
      console.log('Delete your Lambda node.js action from Backand Lambda Services');
      break;
    case 'sync':
    case 's':
      console.log('Usage: ' + 'backand (s)ync'.blue);
      console.log('Syncs your local folder files with the app hosting repository at Backand');
      break;
    case 'app create':
    case 'ac':
      console.log('Usage: ' + 'backand (a)pp (c)reate'.blue);
      console.log('Create new app in Backand');
      break;
    case 'function init':
    case 'fi':
      console.log('Usage: ' + 'backand (f)unction (i)nit'.blue);
      console.log('Initiate a Lambda node.js function in your local folder and create it in AWS Lambda');
      break;
    case 'function deploy':
    case 'fd':
      console.log('Usage: ' + 'backand (f)unction (d)ploy'.blue);
      console.log('Deploy your local Lambda node.js function into AWS Lambda');
      break;
    case 'function delete':
    case 'fe':
      console.log('Usage: ' + 'backand (f)unction d(e)lete'.blue);
      console.log('Delete your Lambda node.js function from AWS Lambda');
      break;
    default:
      console.log('Available commands:'.grey);
      console.log('   help            ' + 'h      ' + '                ' + 'This command');
      console.log('   signup          ' + 'u      ' + '                ' + 'Signup to Backand service and create' +
          ' first app');
      console.log('   signin          ' + 'i      ' + '                ' + 'Signin to Backand app');
      console.log('   signout         ' + 'o      ' + '                ' + 'Signout from Backand');
      console.log('   app create      ' + 'ac     ' + '                ' + 'Create new app in Backand');
      console.log('   get             ' + 'g      ' + '                ' + 'Gets data from a specific object');
      console.log('   sync            ' + 's      ' + '                ' + 'Syncs your local folder files with the' +
          ' app hosting repository at Backand');
      console.log('   action init     ' + 'ai     ' + '                ' + 'Deploy your local Lambda node.js action' +
          ' into Backand Lambda Services');
      console.log('   action deploy   ' + 'ad     ' + '                ' + 'Initiate a Lambda node.js action in your' +
          ' local folder');
      console.log('   action delete   ' + 'ae     ' + '                ' + 'Delete your Lambda node.js action from' +
          ' Backand Lambda Services');
      console.log('   function init   ' + 'fi     ' + '                ' + 'Initiate a Lambda node.js function in' +
          ' your' +
          ' local folder and create it in AWS Lambda');
      console.log('   function deploy ' + 'fd     ' + '                ' + 'Deploy your local Lambda node.js function' +
          ' into AWS Lambda');
      console.log('   function delete ' + 'fe     ' + '                ' + 'Delete your Lambda node.js function from' +
          ' AWS Lambda');
      console.log('\nRun '+ 'help [command]'.blue + ' for more information');
  }
};