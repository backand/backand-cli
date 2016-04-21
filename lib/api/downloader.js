'use strict';
var http = require('http'),
    fs = require('fs'),
    AdmZip = require('adm-zip');


module.exports = {
  downloadAndSaveAs: function(url, path, folder, callback) {
    return http.get(url, function(response) {
      if (response.statusCode === 200) {
        var file = fs.createWriteStream(path);
        var res = response.pipe(file);
        res.on('finish', function(){
          // reading archives
          var zip = new AdmZip(path);
          zip.extractAllToAsync(folder, /*overwrite*/true, function () {
            fs.unlinkSync(path);
            callback();
          });
        })
      }
      else {
        callback(response);
      }
      // Add timeout.
      /*request.setTimeout(12000, function () {
        request.abort();
      });*/
    });
  }
}


