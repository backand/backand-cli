var archiver = require('archiver');
var fs = require('fs');

function zipDirectory(directory, targetZipFile, callback) {
    console.log("zipDirectory", directory, targetZipFile);
    // create a file to stream archive data to.
    var output = fs.createWriteStream(process.cwd() + '/' + targetZipFile);
    var archive = archiver('zip', {
        store: true // Sets the compression method to STORE.
    });

    // listen for all archive data to be written
    output.on('close', function() {
       callback(null);
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      callback(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    
    // append files from a directory
    archive.directory(directory, '/');



    // finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();
}

module.exports.zipDirectory = zipDirectory;