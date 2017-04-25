var expect = require("chai").expect;
var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs');
var async = require('async');
var del = require('del');
var _ = require('lodash');
var replace = require('replace-in-file');
var util = require('util');
var config =  require('../lib/config');

var apiUrl = config.backand.protocol + "://" + config.backand.host;// "https://api.backand.com";

describe("sync", function(){

  var r = Math.random();

  before(function(done){
    del.sync(['src', '.awspublish-hosting.backand.io', '.backand-credentials.json']);
    fs.mkdirSync('src');
    fs.writeFileSync('./src/x.js', '' + r);
    done();
  });

  it("sync", function(done){
    this.timeout(32000);
    var commandSync = 'bin/backand sync --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --folder ./src';
    exec(commandSync, function(err, stdout, stderr) {
      if (err) throw err;
      request.get('https://s3.amazonaws.com/hosting.backand.io/cli/x.js',
          function (error, response, body) {
            if (error) throw error;
            expect(body.trim()).to.equal('' + r);
            done();
          });
    });
  });

  after(function(done){
    del.sync(['src', '.awspublish-hosting.backand.io', '.backand-credentials.json']);
    done();
  });

});

describe("sync with basic authentication", function(){

  var r = Math.random();

  before(function(done){
    del.sync(['src', '.awspublish-hosting.backand.io', '.backand-credentials.json']);
    fs.mkdirSync('src');
    fs.writeFileSync('./src/x.js', '' + r);
    done();
  });

  it("signin", function(done){
    this.timeout(64000);
    var commandSignin = 'bin/backand signin --email johndoe@backand.io --password secret --app cli';
    exec(commandSignin, function(err, stdout, stderr) {
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

  it("sync", function(done){
    this.timeout(32000);
    var commandSync = 'bin/backand sync --app cli --folder ./src';
    exec(commandSync, function(err, stdout, stderr) {
      if (err) throw err;
      request.get('https://s3.amazonaws.com/hosting.backand.io/cli/x.js',
          function (error, response, body) {
            if (error) throw error;
            expect(body.trim()).to.equal('' + r);
            done();
          });
    });
  });

  after(function(done){
    del.sync(['src', '.awspublish-hosting.backand.io', '.backand-credentials.json']);
    done();
  });

});

describe("lambda .NET", function(done){

  var lambdaId = null;
  before(function(done){
    this.timeout(64000);
    async.series({
      clean: function(callback) {
        del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
        var commandActionDelete = 'bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
        exec(commandActionDelete, function(err, stdout, stderr) {
          callback(null);
        });
      },
      init: function(callback){
        var commandActionInit = 'bin/backand action init --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c --app cli --template template';
        exec(commandActionInit, function(err, stdout, stderr) {
          callback(null);
        });
      }
    }, function(err, results) {
      done();
    });
  });

  it("lambda exists", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          var bodyObj = JSON.parse(body);
          expect(Array.isArray(bodyObj.data)).to.be.true;
          expect(bodyObj.data.length).to.be.equal(1);
          lambdaId = bodyObj.data[0].__metadata.id;
          done();
        }
    );
  });

  it("lambda delete", function(done){
    this.timeout(64000);
    async.series({
      deleteDotNet: function(callback){
        request.delete(apiUrl + '/1/businessRule/' + lambdaId,
            {
              auth: {
                'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
                'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
              }
            },
            function(err, response, body){
              callback(null);
            }
        );
      },
      existsDotNet: function(callback){
        request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]',
            {
              auth: {
                'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
                'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
              }
            },
            function(err, response, body){
              var bodyObj = JSON.parse(body);
              callback(null, bodyObj);
            }
        );
      }
    }, function(err, results){
      expect(Array.isArray(results.existsDotNet.data)).to.be.true;
      expect(results.existsDotNet.data.length).to.be.equal(0);
      done();
    });

  });

  after(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });

});

describe("lambda action init and deploy", function(done){


  var lambdaUrl = null;

  before(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });

  it("lambda init", function(done){
    this.timeout(64000);
    var commandActionInit = 'bin/backand action init --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --template template';
    exec(commandActionInit, function(err, stdout, stderr) {
      lambdaUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The action was deployed and can be tested at '); }).replace(/The action was deployed and can be tested at /, '');

      expect(stdout).to.have.string('The action was deployed and can be tested at');
      // test files exist
      fs.readdir('items/testclilambda', (err, files) => {
        var lambdaFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, lambdaFiles).length == 0 && _.difference(lambdaFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });

    });
  });

  it("lambda exists", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          var bodyObj = JSON.parse(body);
          expect(lambdaUrl).to.be.equal('https://www.backand.com/apps/#/app/cli/objects/' + bodyObj.data[0].viewTable + '/actions/' + bodyObj.data[0].iD + '/true');
          done();
        }
    );
  });

  it("lambda call", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/objects/action/items/?name=testclilambda&parameters={}',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          expect(err).to.be.null;
          var bodyObj = JSON.parse(body);
          expect(bodyObj.StatusCode).to.be.equal(200);
          expect(bodyObj.Payload).to.be.equal('{"message":"Hello World!"}');
          done();
        }
    );

  });

  it("lambda deploy", function(done){
    this.timeout(64000);
    var r = Math.random();
    var options = {
      files: 'items/testclilambda/index.js',
      from: /var helloWorld = \{"message": "Hello World!"\}/g,
      to: 'var helloWorld = {"message": "Hello ' + r + '!"}',
    };
    replace.sync(options);
    var commandActionDeploy = 'bin/backand action deploy --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --folder items/testclilambda';
    exec(commandActionDeploy, function(err, stdout, stderr) {
      expect(stdout).to.have.string('The action was deployed and can be tested at');
      request.get(apiUrl + '/1/objects/action/items/?name=testclilambda&parameters={}',
          {
            auth: {
              'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
              'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
            }
          },
          function(err, response, body){
            expect(err).to.be.null;
            var bodyObj = JSON.parse(body);
            expect(bodyObj.StatusCode).to.be.equal(200);
            expect(bodyObj.Payload).to.be.equal('{"message":"Hello ' + r + '!"}');
            done();
          }
      );
    });
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });
});

describe("lambda action delete", function(done){

  var lambdaUrl = null;

  before(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    done();
  });

  it("lambda init", function(done){
    this.timeout(64000);
    var commandActionInit = 'bin/backand action init --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --template template';
    exec(commandActionInit, function(err, stdout, stderr) {
      lambdaUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The action was deployed and can be tested at '); }).replace(/The action was deployed and can be tested at /, '');
      // test files exist
      fs.readdir('items/testclilambda', (err, files) => {
        var lambdaFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, lambdaFiles).length == 0 && _.difference(lambdaFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });

    });
  });

  it("lambda exists", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          var bodyObj = JSON.parse(body);
          expect(lambdaUrl).to.be.equal('https://www.backand.com/apps/#/app/cli/objects/' + bodyObj.data[0].viewTable + '/actions/' + bodyObj.data[0].iD + '/true');
          done();
        }
    );
  });

  it("action delete", function(done){
    this.timeout(64000);
    var commandActionDelete = 'bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      expect(
        _.some(
          stdout.split('\n'), 
          function(s) { return _.startsWith(s, "Action 'testclilambda' was deleted."); }
        )
      ).to.be.true;
      done();
    });
  });

  it("lambda does not exist", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          var bodyObj = JSON.parse(body);
          expect(bodyObj.totalRows).to.be.equal(0);
          done();
        }
    );
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    done();
  });
});

describe("function init and deploy", function(done){

  var functionUrl = null;

  before(function(done){
    this.timeout(64000);
    del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandFunctionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandFunctionDelete, function(err, stdout, stderr) {
      done();
    });
  });

  it("function init", function(done){
    this.timeout(64000);
    var commandFunctionInit = 'bin/backand function init --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --template template';
    exec(commandFunctionInit, function(err, stdout, stderr) {
      functionUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The function was deployed and can be tested at '); }).replace(/The function was deployed and can be tested at /, '');
      // test files exist
      fs.readdir('testclifunction', (err, files) => {
        var functionFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, functionFiles).length == 0 && _.difference(functionFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });

    });
  });

  it("function exists", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclifunction"}]',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          var bodyObj = JSON.parse(body);
          expect(functionUrl).to.be.equal('https://www.backand.com/apps/#/app/cli/function/' + bodyObj.data[0].iD + '/true');
          done();
        }
    );
  });

  it("function call", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/function/general/testclifunction?parameters={}',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          expect(err).to.be.null;
          var bodyObj = JSON.parse(body);
          expect(bodyObj.StatusCode).to.be.equal(200);
          expect(bodyObj.Payload).to.be.equal('{"message":"Hello World!"}');
          done();
        }
    );

  });

  it("function deploy", function(done){
    this.timeout(64000);
    var r = Math.random();
    var options = {
      files: 'testclifunction/index.js',
      from: /var helloWorld = \{"message": "Hello World!"\}/g,
      to: 'var helloWorld = {"message": "Hello ' + r + '!"}',
    };
    replace.sync(options);
    var commandActionDeploy = 'bin/backand function deploy --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --folder testclifunction';
    exec(commandActionDeploy, function(err, stdout, stderr) {
      request.get(apiUrl + '/1/function/general/testclifunction?parameters={}',
          {
            auth: {
              'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
              'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
            }
          },
          function(err, response, body){
            expect(err).to.be.null;
            var bodyObj = JSON.parse(body);
            expect(bodyObj.StatusCode).to.be.equal(200);
            expect(bodyObj.Payload).to.be.equal('{"message":"Hello ' + r + '!"}');
            done();
          }
      );
    });
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });
});

describe("function delete", function(done){

  var functionUrl = null;

  before(function(done){
    this.timeout(64000);
    del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandFunctionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandFunctionDelete, function(err, stdout, stderr) {
      done();
    });
  });

  it("function init", function(done){
    this.timeout(64000);
    var commandFunctionInit = 'bin/backand function init --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --template template';
    exec(commandFunctionInit, function(err, stdout, stderr) {
      functionUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The function was deployed and can be tested at '); }).replace(/The function was deployed and can be tested at /, '');
      // test files exist
      fs.readdir('testclifunction', (err, files) => {
        var functionFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, functionFiles).length == 0 && _.difference(functionFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });

    });
  });

  it("function exists", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclifunction"}]',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          var bodyObj = JSON.parse(body);
          expect(functionUrl).to.be.equal('https://www.backand.com/apps/#/app/cli/function/' + bodyObj.data[0].iD + '/true');
          done();
        }
    );
  });

  it("function delete", function(done){
        this.timeout(64000);
    var commandFunctionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandFunctionDelete, function(err, stdout, stderr) {
      expect(
        _.some(
          stdout.split('\n'), 
          function(s) { return _.startsWith(s, "Function 'testclifunction' was deleted."); }
        )
      ).to.be.true;
      done();
    });
  });

  it("function does not exist", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclifunction"}]',
          {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          var bodyObj = JSON.parse(body);
          expect(bodyObj.totalRows).to.be.equal(0);
          done();
        }
    );
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    done();
  });
});

describe("signin and signout", function(done){

  var r = Date.now() + '0';
  var app = 'cli';
  var email = 'johndoe_' + r + '@backand.io';
  var password = 'secret';

  before(function(done){
    del.sync(['.backand-credentials.json']);
    done();
  });

  it("signin fails for non user", function(done){
    this.timeout(64000);
    var commandSignin = 'bin/backand signin --email ' + email + ' --password ' + password + ' --app cli';
    exec(commandSignin, function(err, stdout, stderr) {
      expect(stdout).to.have.string('The user is not approved for this app');
      done();
    });
  });

  it("signin", function(done){
    this.timeout(64000);
    var commandSignin = 'bin/backand signin --email johndoe@backand.io --password secret --app cli';
    exec(commandSignin, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Logged in successfully to app \'cli\'');
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });


  it("signout", function(done){
    this.timeout(64000);
    var commandSignin = 'bin/backand signout';
    exec(commandSignin, function(err, stdout, stderr) {
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats).to.be.undefined;
        done();
      });
    });
  });

  after(function(done){
    done();
  });

});

describe("signup and create app", function(done){

  var r = Date.now() + '1';
  var app = 'cli';
  var email = 'test_' + r + '@backand.io';
  var fullname = '"John D' + r + '"';
  var password = 'secret';

  before(function(done){
    del.sync(['.backand-credentials.json']);
    done();
  });

  it("signup", function(done){
    this.timeout(64000);
    var commandSignup = 'bin/backand signup --email ' + email + ' --password ' + password + ' --fullname '  +  fullname;
    exec(commandSignup, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Welcome to backand!');
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

  it("signout", function(done){
    this.timeout(64000);
    var commandSignout = 'bin/backand signout';
    exec(commandSignout, function(err, stdout, stderr) {
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats).to.be.undefined;
        done();
      });
    });
  });


  it("signin", function(done){
    this.timeout(64000);
    var commandSignin = 'bin/backand signin --email ' + email + ' --password ' + password;
    exec(commandSignin, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Logged in successfully to Backand');
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

  it("create app", function(done){
    this.timeout(64000);
    var appName = 'app' + r;
    var appTitle = 'title_' + r;
    //console.log('signup and create app appName:' + appName);
    var commandSignin = 'bin/backand app create --name ' + appName + ' --title ' + appTitle;
    exec(commandSignin, function(err, stdout, stderr) {
      expect(stdout).to.have.string("The app '" + appName + "' was created successfully!");
      done();
    });
  });

  after(function(done){
    del.sync(['.backand-credentials.json']);
    done();
  });

});

describe("signup and signin with app", function(done){
 
  var r = Date.now() + '2';
  var app = 'cli';
  var email = 'test_' + r + '@backand.io';
  var fullname = '"John D' + r + '"';
  var password = 'secret';
  var appName = 'app' + r;

  before(function(done){
    del.sync(['.backand-credentials.json']);
    done();
  });

  it("signup", function(done){
    this.timeout(64000);
    var commandSignup = 'bin/backand signup --email ' + email + ' --password ' + password + ' --fullname '  +  fullname + ' --app ' + appName;
    //console.log(commandSignup);
    exec(commandSignup, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Welcome to backand!');
      expect(stdout).to.have.string("The app '" + appName + "' was created successfully!");
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

  it("signout", function(done){
    this.timeout(64000);
    var commandSignout = 'bin/backand signout';
    exec(commandSignout, function(err, stdout, stderr) {
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats).to.be.undefined;
        done();
      });
    });
  });


  it("signin", function(done){
    this.timeout(64000);
    var commandSignin = 'bin/backand signin --email ' + email + ' --password ' + password + ' --app ' + appName;
    //console.log(commandSignin);
    exec(commandSignin, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Logged in successfully to app \'' + appName + '\'');
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

  after(function(done){
    del.sync(['.backand-credentials.json']);
    done();
  });

});

describe("lambda action with signup", function(done){

  var r = Date.now() + '3';
  var email = 'test_' + r + '@backand.io';
  var password = 'secret';
  var appName = 'app' + r;
  var lambdaUrl = null;

  before(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    done();
  });

  it("signup", function(done){
    this.timeout(64000);
    var commandSignup = 'bin/backand signup --email ' + email + ' --password ' + password + ' --app '  +  appName;
    exec(commandSignup, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Welcome to backand!');
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

  it("action init", function(done){
    this.timeout(64000);
    var commandActionInit = 'bin/backand action init --object items --action testclilambda';
    exec(commandActionInit, function(err, stdout, stderr) {
      lambdaUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The action was deployed and can be tested at '); }).replace(/The action was deployed and can be tested at /, '');
      expect(stdout).to.have.string('The action was deployed and can be tested at');
      // test files exist
      fs.readdir('items/testclilambda', (err, files) => {
        var lambdaFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, lambdaFiles).length == 0 && _.difference(lambdaFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });

    });
  });

  // it("lambda call", function(done){
  //   this.timeout(64000);
  //   request.get(apiUrl + '/1/objects/action/items/?name=testclilambda&parameters={}',
  //       {
  //         auth: {
  //           'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
  //           'pass': 'd2b85eba-1c41-11e7-8124-06bcf2b21c8c' //johndoe@backand.com //user
  //         }
  //       },
  //       function(err, response, body){
  //         expect(err).to.be.null;
  //         var bodyObj = JSON.parse(body);
  //         expect(bodyObj.StatusCode).to.be.equal(200);
  //         expect(bodyObj.Payload).to.be.equal('{"message":"Hello World!"}');
  //         done();
  //       }
  //   );
  // });

  it("action deploy", function(done){
    this.timeout(64000);
    var r = Math.random();
    var options = {
      files: 'items/testclilambda/index.js',
      from: /var helloWorld = \{"message": "Hello World!"\}/g,
      to: 'var helloWorld = {"message": "Hello ' + r + '!"}',
    };
    replace.sync(options);
    var commandActionDeploy = 'bin/backand action deploy --object items --action testclilambda';
    exec(commandActionDeploy, function(err, stdout, stderr) {
      expect(stdout).to.have.string('The action was deployed and can be tested at');
      done();
    });
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'bin/backand action delete --object items --action testclilambda';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });
});

describe("lambda action with signin", function(done){

	var lambdaUrl = null;

	before(function(done){
		this.timeout(64000);
		del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
		var commandActionDelete = 'bin/backand action delete --object items --action testclilambda  --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c --app cli';	
		exec(commandActionDelete, function(err, stdout, stderr) {
			done(); 
		});
	});

	it("signin", function(done){
		this.timeout(64000);
		var commandSignin = 'bin/backand signin --email johndoe@backand.io --password secret --app cli';
		exec(commandSignin, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Logged in successfully to app \'cli\'');
      fs.stat('.backand-credentials.json', function(err, stats){
				expect(stats.isFile()).to.be.true;
				done();
			});
		});
	});

	it("action init", function(done){
		this.timeout(64000);
		var commandActionInit = 'bin/backand action init --object items --action testclilambda';
		exec(commandActionInit, function(err, stdout, stderr) {
			lambdaUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The action was deployed and can be tested at '); }).replace(/The action was deployed and can be tested at /, '');
      expect(stdout).to.have.string('The action was deployed and can be tested at');
			// test files exist		
			fs.readdir('items/testclilambda', (err, files) => {
				var lambdaFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
				expect(Array.isArray(files)).to.be.true;
				var theSame = _.difference(files, lambdaFiles).length == 0 && _.difference(lambdaFiles, files).length == 0;
				expect(theSame).to.be.true;
				done(); 
			});
			 	    
		});
	});

	it("lambda exists", function(done){
		this.timeout(64000);	
		request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
				} 	
        	},
        	function(err, response, body){
        		var bodyObj = JSON.parse(body);
        		expect(lambdaUrl).to.be.equal('https://www.backand.com/apps/#/app/cli/objects/' + bodyObj.data[0].viewTable + '/actions/' + bodyObj.data[0].iD + '/true');
        		done();        	
        	}
        );
	});

	it("lambda call", function(done){
		this.timeout(64000);
		request.get(apiUrl + '/1/objects/action/items/?name=testclilambda&parameters={}', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': 'd2b85eba-1c41-11e7-8124-06bcf2b21c8c' //johndoe@backand.com //user
				} 	
        	},
        	function(err, response, body){
        		expect(err).to.be.null;
        		var bodyObj = JSON.parse(body);
        		expect(bodyObj.StatusCode).to.be.equal(200);
        		expect(bodyObj.Payload).to.be.equal('{"message":"Hello World!"}');
        		done();        	
        	}
        );

	});

	it("action deploy", function(done){
		this.timeout(64000);
		var r = Math.random();
		var options = {
			files: 'items/testclilambda/index.js',
			from: /var helloWorld = \{"message": "Hello World!"\}/g,
  			to: 'var helloWorld = {"message": "Hello ' + r + '!"}',
		};
		replace.sync(options);
		var commandActionDeploy = 'bin/backand action deploy --object items --action testclilambda';
		exec(commandActionDeploy, function(err, stdout, stderr) {
			request.get(apiUrl + '/1/objects/action/items/?name=testclilambda&parameters={}', 
	        	{
	        		auth: {
						'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
						'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
					} 	
	        	},
	        	function(err, response, body){
	        		expect(err).to.be.null;
	        		var bodyObj = JSON.parse(body);
	        		expect(bodyObj.StatusCode).to.be.equal(200);
	        		expect(bodyObj.Payload).to.be.equal('{"message":"Hello ' + r + '!"}');
	        		done();        	
	        	}
	        );		
		});
	});

	after(function(done){
		this.timeout(64000);
		del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
		var commandActionDelete = 'bin/backand action delete --app cli --object items --action testclilambda';
		exec(commandActionDelete, function(err, stdout, stderr) {
			done();
		});
	});
});

describe("lambda function with signin", function(done){

	var functionUrl = null;

	before(function(done){
		this.timeout(64000);
		del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
		var commandFunctionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';	
		exec(commandFunctionDelete, function(err, stdout, stderr) {	
			done(); 
		});
	});

  it("signin", function(done){
    this.timeout(64000);
    var commandSignin = 'bin/backand signin --email johndoe@backand.io --password secret --app cli';
    exec(commandSignin, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Logged in successfully to app \'cli\'');
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

	it("function init", function(done){
		this.timeout(64000);
		var commandFunctionInit = 'bin/backand function init --name testclifunction' +
        ' template';
		exec(commandFunctionInit, function(err, stdout, stderr) {			
			functionUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The function was deployed and can be tested at '); }).replace(/The function was deployed and can be tested at /, '');
      expect(stdout).to.have.string('The function was deployed and can be tested at');
			// test files exist		
			fs.readdir('testclifunction', (err, files) => {
				var functionFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
				expect(Array.isArray(files)).to.be.true;
				var theSame = _.difference(files, functionFiles).length == 0 && _.difference(functionFiles, files).length == 0;
				expect(theSame).to.be.true;
				done(); 
			});
			 	    
		});
	});

	it("function exists", function(done){
		this.timeout(64000);	
		request.get(apiUrl + '/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclifunction"}]', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
				} 	
        	},
        	function(err, response, body){
        		var bodyObj = JSON.parse(body);
        		expect(functionUrl).to.be.equal('https://www.backand.com/apps/#/app/cli/function/' + bodyObj.data[0].iD + '/true');
        		done();        	
        	}
        );
	});

	it("function call", function(done){
		this.timeout(64000);
		request.get(apiUrl + '/1/function/general/testclifunction?parameters={}', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
          'pass': 'd2b85eba-1c41-11e7-8124-06bcf2b21c8c' //johndoe@backand.com //user
				} 	
        	},
        	function(err, response, body){
        		expect(err).to.be.null;
        		var bodyObj = JSON.parse(body);
        		expect(bodyObj.StatusCode).to.be.equal(200);
        		expect(bodyObj.Payload).to.be.equal('{"message":"Hello World!"}');
        		done();        	
        	}
        );

	});

	it("function deploy", function(done){
		this.timeout(64000);
		var r = Math.random();
		var options = {
			files: 'testclifunction/index.js',
			from: /var helloWorld = \{"message": "Hello World!"\}/g,
  			to: 'var helloWorld = {"message": "Hello ' + r + '!"}',
		};
		replace.sync(options);
		var commandFunctionDeploy = 'bin/backand function deploy --name testclifunction';
		exec(commandFunctionDeploy, function(err, stdout, stderr) {
      expect(stdout).to.have.string('The function was deployed and can be tested at');
			request.get(apiUrl + '/1/function/general/testclifunction?parameters={}', 
	        	{
	        		auth: {
						'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
						'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
					} 	
	        	},
	        	function(err, response, body){
	        		expect(err).to.be.null;
	        		var bodyObj = JSON.parse(body);
	        		expect(bodyObj.StatusCode).to.be.equal(200);
	        		expect(bodyObj.Payload).to.be.equal('{"message":"Hello ' + r + '!"}');
	        		done();        	
	        	}
	        );		
		});
	});

	after(function(done){
		this.timeout(64000);
		del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
		var commandFunctionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';	
		exec(commandFunctionDelete, function(err, stdout, stderr) {
			done(); 
		});
	});
});

describe("lambda function with signup", function(done){

  var r = Date.now() + '4';
  var email = 'test_' + r + '@backand.io';
  var password = 'secret';
  var appName = 'app' + r;
  var lambdaUrl = null;

  before(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    done();
  });

  it("signup", function(done){
    this.timeout(64000);
    var commandSignup = 'bin/backand signup --email ' + email + ' --password ' + password + ' --app '  +  appName;
    exec(commandSignup, function(err, stdout, stderr) {
      expect(stdout).to.have.string('Welcome to backand!');
      fs.stat('.backand-credentials.json', function(err, stats){
        expect(stats.isFile()).to.be.true;
        done();
      });
    });
  });

  it("function init", function(done){
    this.timeout(64000);
    var commandFunctionInit = 'bin/backand function init --name testclifunction' +
        ' template';
    exec(commandFunctionInit, function(err, stdout, stderr) {
      functionUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The function was deployed and can be tested at '); }).replace(/The function was deployed and can be tested at /, '');
      expect(stdout).to.have.string('The function was deployed and can be tested at');
      // test files exist
      fs.readdir('testclifunction', (err, files) => {
        var functionFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, functionFiles).length == 0 && _.difference(functionFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });

    });
  });

  // it("lambda call", function(done){
  //   this.timeout(64000);
  //   request.get(apiUrl + '/1/objects/action/items/?name=testclilambda&parameters={}',
  //       {
  //         auth: {
  //           'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
  //           'pass': 'd2b85eba-1c41-11e7-8124-06bcf2b21c8c' //johndoe@backand.com //user
  //         }
  //       },
  //       function(err, response, body){
  //         expect(err).to.be.null;
  //         var bodyObj = JSON.parse(body);
  //         expect(bodyObj.StatusCode).to.be.equal(200);
  //         expect(bodyObj.Payload).to.be.equal('{"message":"Hello World!"}');
  //         done();
  //       }
  //   );
  // });

  it("function deploy", function(done){
    this.timeout(64000);
    var r = Math.random();
    var options = {
      files: 'testclifunction/index.js',
      from: /var helloWorld = \{"message": "Hello World!"\}/g,
      to: 'var helloWorld = {"message": "Hello ' + r + '!"}',
    };
    replace.sync(options);
    var commandFunctionDeploy = 'bin/backand function deploy --name testclifunction';
    exec(commandFunctionDeploy, function(err, stdout, stderr) {
      expect(stdout).to.have.string('The function was deployed and can be tested at');
      done();
    });
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandFunctionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandFunctionDelete, function(err, stdout, stderr) {
      done();
    });
  });
});
