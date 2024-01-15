/**
 * External dependencies
 */
const path = require("path");
const fs = require("fs");
const https = require("https");

/**
 * Internal dependencies
 */
const { CURRENT_RELEASE } = require("./constants");


function releasePath( addPath  = '' ) {
  return path.resolve( __dirname, '..', 'releases', CURRENT_RELEASE, addPath );
}

async function downloadFile(url, destPath) {
    const directoryPath = path.dirname(destPath);
    fs.mkdirSync(directoryPath, { recursive: true });

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const request = https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(resolve);  // close() is async, call resolve after close completes.
            });
        }).on('error', function (err) { // Handle errors
            fs.unlink(destPath); // Delete the file async. (But we don't check the result)
            reject(err.message);
        });
    });
}

module.exports = {
    releasePath,
    downloadFile,
};
