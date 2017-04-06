var expect = require("chai").expect;
var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs');
var async = require('async');
var del = require('del');
var _ = require('lodash');
replace = require('replace-in-file');


//to run the test: node_modules/mocha/bin/mocha

describe("sync", function(){

	var r = Math.random();

	before(function(done){
		del.sync(['src']);	
		fs.mkdirSync('src');
		fs.writeFileSync('./src/x.js', '' + r);		
		done(); 
	});

	it("sync", function(done){
		this.timeout(32000);
		var commandSync = '../node_modules/backand/bin/backand sync --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --folder ./src';	
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
		del.sync(['src']);
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
				var commandActionDelete = '../node_modules/backand/bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli';	
				exec(commandActionDelete, function(err, stdout, stderr) {
					callback(null);
				});
		    },
		    init: function(callback){
		    	var commandActionInit = '../node_modules/backand/bin/backand action init --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --template template';	
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
		request.get('https://api.backand.com/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
				} 	
        	},
        	function(err, response, body){
        		var bodyObj = JSON.parse(body);	
        		expect(Array.isArray(bodyObj.data)).to.be.true;
        		expect(bodyObj.data.length).to.be.equal(1);
        		done();        	
        	}
        );
	});

	it("lambda delete", function(done){
		this.timeout(64000);
		async.series({
			deleteDotNet: function(callback){
				request.delete('https://api.backand.com/1/businessRule/' + lambdaId, 
		        	{
		        		auth: {
							'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
							'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
						} 	
		        	},
		        	function(err, response, body){
		        		callback(null);        	
		        	}
		        );	
			},
			existsDotNet: function(callback){
				request.get('https://api.backand.com/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]', 
		        	{
		        		auth: {
							'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
							'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
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
		var commandActionDelete = '../node_modules/backand/bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli';	
		exec(commandActionDelete, function(err, stdout, stderr) {
			done(); 
		});
	});

});


describe("lambda init and deploy", function(done){

	var lambdaUrl = null;

	before(function(done){
		this.timeout(64000);
		del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
		var commandActionDelete = '../node_modules/backand/bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli';	
		exec(commandActionDelete, function(err, stdout, stderr) {
			done(); 
		});
	});

	it("lambda init", function(done){
		this.timeout(64000);
		var commandActionInit = '../node_modules/backand/bin/backand action init --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --template template';	
		exec(commandActionInit, function(err, stdout, stderr) {
			var lines = stdout.split('\n');
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
		request.get('https://api.backand.com/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclilambda"}]', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
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
		request.get('https://api.backand.com/1/objects/action/items/?name=testclilambda&parameters={}', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
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
		var commandActionDeploy = '../node_modules/backand/bin/backand action deploy --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --folder items/testclilambda';	
		exec(commandActionDeploy, function(err, stdout, stderr) {
			request.get('https://api.backand.com/1/objects/action/items/?name=testclilambda&parameters={}', 
	        	{
	        		auth: {
						'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
						'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
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
		var commandActionDelete = '../node_modules/backand/bin/backand action delete --object items --action testclilambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli';	
		exec(commandActionDelete, function(err, stdout, stderr) {
			done(); 
		});
	});
})

describe.only("function init and deploy", function(done){

	var functionUrl = null;

	before(function(done){
		this.timeout(64000);
		del.sync(['testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
		var commandFunctionDelete = '../node_modules/backand/bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli';	
		exec(commandFunctionDelete, function(err, stdout, stderr) {	
			done(); 
		});
	});

	it("function init", function(done){
		this.timeout(64000);
		var commandFunctionInit = '../node_modules/backand/bin/backand function init --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --template template';	
		exec(commandFunctionInit, function(err, stdout, stderr) {			
			var lines = stdout.split('\n');
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
		request.get('https://api.backand.com/1/businessRule?filter=[{fieldName:"Name",operator:"equals",value:"testclifunction"}]', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
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
		request.get('https://api.backand.com/1/function/general/testclifunction?parameters={}', 
        	{
        		auth: {
					'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
					'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
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
		var commandActionDeploy = '../node_modules/backand/bin/backand function deploy --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --folder testclifunction';	
		exec(commandActionDeploy, function(err, stdout, stderr) {
			request.get('https://api.backand.com/1/function/general/testclifunction?parameters={}', 
	        	{
	        		auth: {
						'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
						'pass': '757e33ac-ad5a-11e5-be83-0ed7053426cb'
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
		var commandActionDelete = '../node_modules/backand/bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli';	
		exec(commandActionDelete, function(err, stdout, stderr) {
			done(); 
		});
	});
})

