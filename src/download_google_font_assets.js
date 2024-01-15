/**
 * External dependencies
 */
const fs = require('fs');
const path = require("path");

/**
 * Internal dependencies
 */
const { GOOGLE_FONTS_FILE, DOWNLOAD_FOLDER } = require('./constants');
const { releasePath, downloadFile } = require('./utils');


function getFamilies() {
    const googleFontsFile = fs.readFileSync(
        releasePath(GOOGLE_FONTS_FILE),
        "utf8"
    );
    const googleFonts = JSON.parse(googleFontsFile);
    return googleFonts.fontFamilies;
}


async function downloadFontFamilies() {
    const families = getFamilies();
    let facesCount = 0;
    let facesSuccessCount = 0;

    for (let i = 0; i < families.length; i++) {
        console.info(`ℹ️  Downloading ${families[i].name} (${i + 1}/${families.length})`);
        for (let x = 0; x < families[i].fontFace.length; x++) {
            facesCount++;

            const url = families[i].fontFace[x]['src'];
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
