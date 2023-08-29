/**
 * External dependencies
 */
const fs = require( 'fs' );
const https = require( "https" );
const path = require( "path" );
const TextToSVG = require('text-to-svg');

/**
 * Internal dependencies
 */
const { GOOGLE_FONTS_FILE_PATH, GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH } = require( './constants' );


function getFamilies() {
    const googleFontsFile = fs.readFileSync(GOOGLE_FONTS_FILE_PATH, "utf8");
    const googleFonts = JSON.parse(googleFontsFile);
    return googleFonts.fontFamilies;
}

function updateGoogleFontsFileWithPreviews( newFontFamilies ) {
    const googleFontsFile = fs.readFileSync(GOOGLE_FONTS_FILE_PATH, "utf8");
    const content = JSON.parse( googleFontsFile );
    content.fontFamilies = newFontFamilies;
    fs.writeFileSync( GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH, JSON.stringify( content, null, 2 ) );
}

function getPreviewFilename( family, face, isAFamilyPreview ) {
    const name = isAFamilyPreview
        ? `${family.slug}`
        : `${family.slug}-${face.fontWeight}-${face.fontStyle}`;
    return `${name}.svg`;
}

function generateFontFacePreview( family, face, isAFamilyPreview ) {
    const text = isAFamilyPreview
        ? family.name
        :  `${family.name} ${face.fontWeight} ${face.fontStyle}`;

    // Loads font asset.
    const fontAssetPath = face.src.replace("https://fonts.gstatic.com/s/", "./font-assets/");
    const textToSVG = TextToSVG.loadSync( fontAssetPath );
    // Generates SVG.
    const attributes = {fill: 'black'};
    const options = {x: 0, y: 0, fontSize: 24, anchor: 'top', attributes: attributes};
    const svgMarkup = textToSVG.getSVG( text, options );

    const fileName = getPreviewFilename( family, face, isAFamilyPreview );
    const svgPath = `./output/previews/${family.slug}/${fileName}`;

    const directoryPath = path.dirname(svgPath);
    
    // Writes the SVG file.
    fs.mkdirSync(directoryPath, { recursive: true });
    fs.writeFileSync( svgPath, svgMarkup );

    console.log(`✅ Generated ${svgPath}`);
}

function generateFontFamilyPreview( family ){
    // Select the font face to make the preview (try to get 400, normal if it's there)
    const face = family.fontFace.find( ( face ) => face.fontWeight === '400' && face.fontStyle === 'normal' ) || family.fontFace[ 0 ];
    generateFontFacePreview( family, face, family.name, true );
}

function generatePreviews() {
    const families = getFamilies();
    const familiesCount = families.length;
    let familiesSuccessCount = 0;
    let facesCount = 0;
    let facesSuccessCount = 0;
    const updatedFontFamilies = [];

    if ( fs.existsSync("./output/previews") ) {
        // Wipes out the previews directory.
        fs.rmdirSync("./output/previews", { recursive: true });
    } else {
        // Creates the previews directory.
        fs.mkdirSync("./output/previews", { recursive: true });
    }

    for (let i = 0; i < families.length; i++) {
        const family = families[i];
        const updatedFamily = { ...family, fontFace: [] };
        try {
            console.log(`ℹ️  Generating SVG previews for ${family.name} (${i + 1}/${families.length})`);
            generateFontFamilyPreview( family );
            updatedFamily.preview = getPreviewFilename( family, null, true );
            familiesSuccessCount++;
        } catch (error) {
            console.error(`❎  Error generating preview for ${family.name}: ${error}`);
        }
        
        for (let x = 0; x < family.fontFace.length; x++ ) {
            facesCount++;
            const face = family.fontFace[x];
            try {
                generateFontFacePreview( family, face );
                updatedFamily.fontFace.push( { ...face, preview: getPreviewFilename( family, face, false ) } );
                facesSuccessCount++;
            } catch (error) {
                console.error(`❎  Error generating preview for ${family.name} ${face.fontWeight} ${face.fontStyle}: ${error}`);
            }

        }
        updatedFontFamilies.push( updatedFamily );
        console.log("");
    }

    if ( familiesCount === familiesSuccessCount ) {
        console.log(`🏅  Generated ${familiesSuccessCount} of ${familiesCount} SVG previess for font families.`);
    } else {
        console.warn(`🚩  Generated ${familiesSuccessCount} of ${familiesCount} SVG previews font families. Check for errors.`);
    }

    if ( facesCount === facesSuccessCount ) {
        // Creates a new google-fonts.json file with the previews.
        updateGoogleFontsFileWithPreviews( updatedFontFamilies );
        console.log(`🏅  Generated ${facesSuccessCount} of ${facesCount} SVG previews for font faces.`);
    } else { 
        console.warn(`🚩  Generated ${facesSuccessCount} of ${facesCount} SVG previews for font faces. Check for errors.`);
    }

}

generatePreviews();