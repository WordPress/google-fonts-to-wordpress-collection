/**
 * External dependencies
 */
const fs = require('fs');
const https = require("https");
const path = require("path");

/**
 * Internal dependencies
 */
const { GOOGLE_FONTS_FILE_PATH } = require('./constants');


function getFamilies() {
    const googleFontsFile = fs.readFileSync(GOOGLE_FONTS_FILE_PATH, "utf8");
    const googleFonts = JSON.parse(googleFontsFile);
    return googleFonts.font_families;
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

async function downloadFontFamilies() {

    // wipe out the font-assets directory
    fs.rmdirSync("./font-assets", { recursive: true });

    const families = getFamilies();
    let facesCount = 0;
    let facesSuccessCount = 0;

    for (let i = 0; i < families.length; i++) {
        console.info(`ℹ️  Downloading ${families[i].font_family_settings.name} (${i + 1}/${families.length})`);
        for (let x = 0; x < families[i].font_family_settings.fontFace.length; x++) {
            facesCount++;

            const url = families[i].font_family_settings.fontFace[x]['src'];
            const relativePath = url.replace("https://fonts.gstatic.com/s/", "");
            const destPath = "./" + path.join("font-assets/", relativePath);

            try {
                await downloadFile(url, destPath);
                facesSuccessCount++;
                console.log(`✅ Downloaded to ${destPath}`);
            } catch (error) {
                console.error(`❎  Failed to download ${url}: ${error}`);
            }
            console.log("");
        }

    }

    if (facesCount === facesSuccessCount) {
        console.log(`🏅  Downloaded ${facesSuccessCount} of ${facesCount} font faces.`);
    } else {
        console.warn(`🚩  Downloaded ${facesSuccessCount} of ${facesCount} font faces. Check for errors.`);
    }

}

downloadFontFamilies();