var AWS = require('aws-sdk');
var temporaryCredentialsFile = './.backand-credentials.json';
var async = require('async');
var fs = require('fs');



function uploadOneFile(fileName, bucket, key, callback){
	var readStream = fs.createReadStream(fileName);
	var params = {Bucket: bucket, Key: key, Body: readStream};
	var options = { partSize: 5 * 1024 * 1024, queueSize: 10 };
	var s3 = new AWS.S3({ useAccelerateEndpoint: true,httpOptions: { timeout: 10 * 60 * 1000 }});
	s3.upload(params, options)
	.on('httpUploadProgress', function(evt) { 
		console.log('Completed ' + (evt.loaded * 100 / evt.total).toFixed() + '% of upload');
	})
    .send(function(err, data) { 
		console.log('Wait while we configure...');
		callback(err);
    });
}

function upload(appName, destFolder, zipFileName, zipFile, callback){
  // get credentials
  var cred = fs.readFileSync(temporaryCredentialsFile, 'utf8');

  var storedData = JSON.parse(cred);

  if (appName){
    storedData = storedData[appName];
  }
  else {
    storedData = _.first(_.values(storedData))
  }

  if (!storedData){
    return gulp.src(folder)
        .pipe(notify({
          message: "No credentials for this app",
          title: "Failure",
          notifier: function (options, callback) {
            console.log(options.title + ":" + options.message);
            callback();
          }
        }));
  }

  var credentials = storedData['nodejs'].credentials;
  AWS.config.update(credentials);

  var info = storedData['nodejs'].info;
  var dir = info.dir;
  if (destFolder)
    dir = dir  + "/" + destFolder;
  var bucket = info.bucket;
  uploadOneFile(zipFile, bucket, dir + "/" + zipFileName, callback);

}

module.exports.upload = upload;