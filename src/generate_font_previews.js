/**
 * External dependencies
 */
const fs = require('fs');
const path = require("path");
const TextToSVG = require('text-to-svg');

/**
 * Internal dependencies
 */
const { GOOGLE_FONTS_FILE, GOOGLE_FONTS_WITH_PREVIEWS_FILE, SVG_PREVIEWS_BASE_URL, DOWNLOAD_FOLDER, PREVIEWS_FOLDER } = require('./constants');
const { releasePath, downloadFile } = require('./utils');

function getFamilies() {
    const googleFontsFile = fs.readFileSync(
        releasePath( GOOGLE_FONTS_FILE ),
        "utf8"
    );
    const googleFonts = JSON.parse( googleFontsFile );
    return googleFonts.font_families;
}

function updateGoogleFontsFileWithPreviews(newFontFamilies) {
    const googleFontsFile = fs.readFileSync(GOOGLE_FONTS_FILE, "utf8");
    const content = JSON.parse(googleFontsFile);
    content.font_families = newFontFamilies;
    fs.writeFileSync( releasePath( GOOGLE_FONTS_WITH_PREVIEWS_FILE ) , JSON.stringify(content, null, 2));
}

function getPreviewUrl(family, face, isAFamilyPreview) {
    const fileName = getPreviewFilename(family, face, isAFamilyPreview);
    return `${SVG_PREVIEWS_BASE_URL}${family.slug}/${fileName}`;
};

function getPreviewFilename(family, face, isAFamilyPreview) {
    const name = isAFamilyPreview
        ? `${family.slug}`
        : `${family.slug}-${face.fontWeight}-${face.fontStyle}`;
    return `${name}.svg`;
}

async function generateFontFacePreview(family, face, isAFamilyPreview) {
    const text = isAFamilyPreview
        ? family.name
        : `${family.name} ${face.fontWeight} ${face.fontStyle}`;

    const downloadFolder =releasePath( DOWNLOAD_FOLDER );
    const localFontPath = face.src.replace("https://fonts.gstatic.com/s", downloadFolder);
    
    await downloadFile( face.src, localFontPath );

    // Loads font asset.
    const fontAssetPath = face.src.replace("https://fonts.gstatic.com/s", downloadFolder);
    const textToSVG = TextToSVG.loadSync(fontAssetPath);

    // Generates SVG.
    const attributes = { fill: 'black' };
    const options = { x: 0, y: 0, fontSize: 24, anchor: 'top', attributes: attributes };
    const svgMarkup = textToSVG.getSVG(text, options);

    // Saves SVG file.
    const fileName = getPreviewFilename(family, face, isAFamilyPreview);
    const svgPath = releasePath( `${PREVIEWS_FOLDER}/${family.slug}/${fileName}` );
    const directoryPath = path.dirname(svgPath);

    // Writes the SVG file.
    fs.mkdirSync(directoryPath, { recursive: true });
    fs.writeFileSync(svgPath, svgMarkup);

    console.log(`✅ Generated ${svgPath}`);
}

async function generateFontFamilyPreview(family) {
    // Select the font face to make the preview (try to get 400, normal if it's there)
    const face = family.fontFace.find((face) => face.fontWeight === '400' && face.fontStyle === 'normal') || family.fontFace[0];
    await generateFontFacePreview(family, face, family.name, true);
}

async function generatePreviews() {
    const families = getFamilies();
    const familiesCount = families.length;
    let familiesSuccessCount = 0;
    let facesCount = 0;
    let facesSuccessCount = 0;
    const updatedFontFamilies = [];

    for (let i = 0; i < families.length; i++) {
        
        const family = families[i].font_family_settings;
        const updatedFamily = { ...family, fontFace: [] };
        try {
            console.log(`ℹ️  Generating SVG previews for ${family.name} (${i + 1}/${families.length})`);
            await generateFontFamilyPreview(family);
            updatedFamily.preview = getPreviewUrl(family, null, true);
            familiesSuccessCount++;
        } catch (error) {
            console.error(`❎  Error generating preview for ${family.name}: ${error}`);
        }

        for (let x = 0; x < family.fontFace.length; x++) {
            facesCount++;
            const face = family.fontFace[x];
            try {
                generateFontFacePreview(family, face);
                updatedFamily.fontFace.push({ ...face, preview: getPreviewUrl(family, face, false) });
                facesSuccessCount++;
            } catch (error) {
                console.error(`❎  Error generating preview for ${family.name} ${face.fontWeight} ${face.fontStyle}: ${error}`);
            }

        }

        updatedFontFamilies.push( { ...families[i], font_family_settings: updatedFamily } );
    }

    if (familiesCount === familiesSuccessCount) {
        console.log(`🏅  Generated ${familiesSuccessCount} of ${familiesCount} SVG previess for font families.`);
    } else {
        console.warn(`🚩  Generated ${familiesSuccessCount} of ${familiesCount} SVG previews font families. Check for errors.`);
    }

    if (facesCount === facesSuccessCount) {
        // Creates a new google-fonts.json file with the previews.
        updateGoogleFontsFileWithPreviews(updatedFontFamilies);
        console.log(`🏅  Generated ${facesSuccessCount} of ${facesCount} SVG previews for font faces.`);
    } else {
        console.warn(`🚩  Generated ${facesSuccessCount} of ${facesCount} SVG previews for font faces. Check for errors.`);
    }

}

generatePreviews();