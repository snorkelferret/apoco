module.exports = {Harvey:{},UI:{}};
/*var fs = require('fs');
var browserify = require('browserify');

module.exports = function( callback ) {
    var Harvey={};
    var UI={};
    callback = callback || function(){};

    // Create a write stream for the pipe to output to
    var bundleFs = fs.createWriteStream(bundle.js); //__dirname + '/public/browserify/bundle.js');

    var b = browserify({standalone: 'nodeModules'});
    b.add('./index.js');
    b.bundle().pipe(bundleFs);

    //now listen out for the finish event to know when things have finished 
    bundleFs.on('finish', function () {
        console.log('finished writing the browserify file');
        return callback();
    });
};
*/
