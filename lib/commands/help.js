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
      console.log('Signs you up to the Backand service and creates your first app');
      break;
    case 'signin':
    case 'i':
      console.log('Usage: ' + 'backand sign(i)n'.blue);
      console.log('Signs a user in to a Backand app');
      break;
    case 'signout':
    case 'o':
      console.log('Usage: ' + 'backand sign(o)ut'.blue);
      console.log('Signs a user out from a Backand app');
      break;
    case 'get':
    case 'g':
      console.log('Usage: ' + 'backand (g)et'.blue + ' <appName> <tableName>');
      console.log('Gets data from a specific object in the specified app');
      break;
    case 'action init':
    case 'ai':
      console.log('Usage: ' + 'backand (a)ction (i)nit'.blue);
      console.log('Initialize a Lambda Node.js action in your local folder, and download our Node.JS test harness');
      break;
    case 'action deploy':
    case 'ad':
      console.log('Usage: ' + 'backand (a)ction (d)ploy'.blue);
      console.log('Deploys your local Lambda Node.js action to AWS Lambda using Backand');
      break;
    case 'action delete':
    case 'ae':
      console.log('Usage: ' + 'backand (a)ction d(e)lete'.blue);
      console.log('Deletes your Lambda node.js action from Backand and AWS');
      break;
    case 'action run':
    case 'ar':
      console.log('Usage: ' + 'backand (a)ction (r)un'.blue);
      console.log('Invoke your Lambda node.js action');
      break;
    case 'sync':
    case 's':
      console.log('Usage: ' + 'backand (s)ync'.blue);
      console.log('Synchronizes your local files with the app hosting repository at Backand');
      break;
    case 'app create':
    case 'ac':
      console.log('Usage: ' + 'backand (a)pp (c)reate'.blue);
      console.log('Creates a new app in Backand');
      break;
    case 'function init':
    case 'fi':
      console.log('Usage: ' + 'backand (f)unction (i)nit'.blue);
      console.log('Initialize a Lambda Node.js function in your local folder, and download our Node.JS test harness.');
      console.log('These functions are independent, and not tied to an object.');
      break;
    case 'function deploy':
    case 'fd':
      console.log('Usage: ' + 'backand (f)unction (d)ploy'.blue);
      console.log('Deploys your local Lambda Node.js function to AWS Lambda using Backand');
      break;
    case 'function delete':
    case 'fe':
      console.log('Usage: ' + 'backand (f)unction d(e)lete'.blue);
      console.log('Deletes your Lambda node.js function from Backand and AWS');
      break;
    case 'function run':
    case 'fr':
      console.log('Usage: ' + 'backand (f)unction (r)un'.blue);
      console.log('Invoke your Lambda node.js function');
      break;

    case 'object getList':
    case 'ol':
      console.log('Usage: ' + 'backand (o)bject get(L)ist'.blue);
      console.log('Fetches a list of records from the specified object');
      console.log('Uses options to store filter data, and parameters to store additional fields you wish to send through');
      break;

    case 'object getOne':
    case 'oo':
      console.log('Usage: ' + 'backand (o)bject get(O)ne'.blue);
      console.log('Retrieves a single record from the specified object');
      break;
    case 'object create':
    case 'oc':
      console.log('Usage: ' + 'backand (o)bject (c)reate'.blue);
      console.log('Creates a record with the provided data in the specified object');
      break;
    case 'object update':
    case 'ou':
      console.log('Usage: ' + 'backand (o)bject (u)pdate'.blue);
      console.log('Updates a record with the specified ID in the specified object with the provided data');
      break;
    case 'object remove':
    case 'or':
      console.log('Usage: ' + 'backand (o)bject (r)emove'.blue);
      console.log('Deletes a record from the specified object with the specified ID');
      break;
    default:
      console.log('\nAuth commands:'.grey);
      console.log('   help            ' + 'h      ' + '                ' + 'This command');
      console.log('   signup          ' + 'u      ' + '                ' + 'Sign up with Backand service and create' +
          ' your first app');
      console.log('   signin          ' + 'i      ' + '                ' + 'Sign in to a Backand app');
      console.log('   signout         ' + 'o      ' + '                ' + 'Sign out from Backand');
      console.log('\nApp commands:'.grey);
      console.log('   app create      ' + 'ac     ' + '                ' + 'Creates a new app in Backand');
      console.log('   sync            ' + 's      ' + '                ' + 'Syncs your local folder files with the' +
          ' app hosting repository at Backand');
      console.log('\nAction commands:'.grey);
      console.log('   action init     ' + 'ai     ' + '                ' + 'Initializes a Lambda node.js action in' +
          ' your local folder');
      console.log('   action deploy   ' + 'ad     ' + '                ' + 'Deploy your local Lambda node.js action' +
          ' to AWS Lambda');
      console.log('   action delete   ' + 'ae     ' + '                ' + 'Deletes your Lambda Node.js action from' +
          ' Backand and AWS');
      console.log('   action run      ' + 'ar     ' + '                ' + 'Invoke your Lambda node.js action');
      console.log('\nFunction commands:'.grey);
      console.log('   function init   ' + 'fi     ' + '                ' + 'Initializes a Lambda node.js function in' +
          ' your local folder, and creates it in AWS Lambda');
      console.log('   function deploy ' + 'fd     ' + '                ' + 'Deploy your local Lambda node.js function' +
          ' to AWS Lambda');
      console.log('   function delete ' + 'fe     ' + '                ' + 'Deletes your Lambda node.js function from' +
          ' Backand and AWS');
      console.log('   function run    ' + 'fr     ' + '                ' + 'Invoke your Lambda node.js function');
      console.log('\nObject commands:'.grey);
      console.log('   object getList  ' + 'ol     ' + '                ' + 'Fetches a list of records from the specified object');
      console.log('   object getOne   ' + 'oo     ' + '                ' + 'Retrieves a single record from the specified object');
      console.log('   object create   ' + 'oc     ' + '                ' + 'Creates a record with the provided data in the specified object');
      console.log('   object update   ' + 'ou     ' + '                ' + 'Updates a record with the specified ID in the specified object with the provided data');
      console.log('   object remove   ' + 'or     ' + '                ' + 'Deletes a record from the specified object with the specified ID');
      console.log('\nRun '+ 'help [command]'.blue + ' for more information');
  }
};
