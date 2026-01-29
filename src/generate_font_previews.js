/* eslint-disable no-console */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const TextToSVG = require( 'text-to-svg' );
const wawoff2 = require( 'wawoff2' );

/**
 * This is a collection of fonts that render poorly.  Exclude them from the preview generation.
 */
const excludedFontFamilies = [
	'chenla',
	'coiny',
	'concert-one',
	'content',
	'cutive',
	'englebert',
	'khmer',
	'liu-jian-mao-cao',
	'material-icons',
	'material-icons-outlined',
	'material-icons-round',
	'material-icons-sharp',
	'material-icons-two-tone',
	'noto-color-emoji',
	'noto-emoji',
	'noto-emoji',
	'noto-kufi-arabic',
	'noto-sans-arabic',
	'noto-sans-lycian',
	'noto-sans-myanmar',
	'noto-sans-phags-pa',
	'noto-sans-signwriting',
	'noto-serif-myanmar',
	'revalia',
	'siemreap',
	'updock',
	// This font may be corrupted.
	'phetsarath',
];
/**
 * Internal dependencies
 */
const {
	GOOGLE_FONTS_FILE,
	GOOGLE_FONTS_WITH_PREVIEWS_FILE,
	SVG_PREVIEWS_BASE_URL,
	DOWNLOAD_FOLDER,
	PREVIEWS_FOLDER,
	COLLECTIONS_FOLDER,
} = require( './constants' );
const { releasePath, downloadFile } = require( './utils' );

function updateGoogleFontsFileWithPreviews( newFontFamilies ) {
	const googleFontsFile = fs.readFileSync(
		releasePath( `${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }` ),
		'utf8'
	);
	const content = JSON.parse( googleFontsFile );
	content.font_families = newFontFamilies;
	fs.writeFileSync(
		releasePath(
			`${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_WITH_PREVIEWS_FILE }`
		),
		JSON.stringify( content, null, 2 )
	);
}

function getPreviewUrl( family, face, isAFamilyPreview ) {
	const fileName = getPreviewFilename( family, face, isAFamilyPreview );
	return `${ SVG_PREVIEWS_BASE_URL }${ family.slug }/${ fileName }`;
}

function getPreviewFilename( family, face, isAFamilyPreview ) {
	const name = isAFamilyPreview
		? `${ family.slug }`
		: `${ family.slug }-${ face.fontWeight }-${ face.fontStyle }`;
	return `${ name }.svg`;
}

/*
  * Loads the font asset and returns a TextToSVG instance.
  * If the font asset is a WOFF2 file, it will be decoded to a TTF file.

  * @param {string} fontAssetPath - The path to the font asset.
  * @return {Promise<TextToSVG>} - The TextToSVG instance.
*/
async function loadFontToTextToSVG( fontAssetPath ) {
	if ( fontAssetPath.endsWith( '.woff2' ) ) {
		// Decodes WOFF2 font asset.
		const fileData = fs.readFileSync( fontAssetPath );
		// Writes a temporary ttf file.
		const ttfFontAssetPath = fontAssetPath.replace( '.woff2', '.ttf' );
		const decodedData = await wawoff2.decompress( fileData );
		fs.writeFileSync( ttfFontAssetPath, decodedData );
		const textToSVG = TextToSVG.loadSync( ttfFontAssetPath );
		// Deletes the temporary ttf file.
		fs.unlinkSync( ttfFontAssetPath );
		return textToSVG;
	}
	const textToSVG = TextToSVG.loadSync( fontAssetPath );
	return textToSVG;
}

async function generateFontFacePreview( family, face, isAFamilyPreview ) {
	const text = isAFamilyPreview
		? family.name
		: `${ family.name } ${ face.fontWeight } ${ face.fontStyle }`;

	const downloadFolder = releasePath( DOWNLOAD_FOLDER );
	const customFileName = `${ family.slug }-${ face.fontWeight }-${
		face.fontStyle
	}${ path.extname( face.src ) }`;
	const localFontPath = path.join(
		downloadFolder,
		family.slug,
		customFileName
	);

	// Downloads font asset if it doesn't exist and if its not empty.
	if ( ! fs.existsSync( localFontPath ) ) {
		await downloadFile( face.src, localFontPath );
	}

	// Loads font asset to TextToSVG instance.
	const textToSVG = await loadFontToTextToSVG( localFontPath );

	// Generates SVG.
	const attributes = { fill: 'black' };
	const options = {
		x: 0,
		y: 0,
		fontSize: 24,
		anchor: 'top',
		attributes,
	};
	const svgMarkup = textToSVG.getSVG( text, options );

	// Saves SVG file.
	const fileName = getPreviewFilename( family, face, isAFamilyPreview );
	const svgPath = releasePath(
		`${ PREVIEWS_FOLDER }/${ family.slug }/${ fileName }`
	);
	const directoryPath = path.dirname( svgPath );

	// Writes the SVG file.
	fs.mkdirSync( directoryPath, { recursive: true } );
	fs.writeFileSync( svgPath, svgMarkup );

	console.log( `- Generated ${ svgPath }` );
}

async function generateFontFamilyPreview( family ) {
	// Select the font face to make the preview (try to get 400, normal if it's there)
	const face =
		family.fontFace.find(
			( _face ) =>
				_face.fontWeight === '400' && _face.fontStyle === 'normal'
		) || family.fontFace[ 0 ];
	await generateFontFacePreview( family, face, family.name, true );
}

async function generatePreviews() {
	const filePath = releasePath(
		`${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }`
	);
	if ( ! fs.existsSync( filePath ) ) {
		console.error( `❌ File not found: ${ filePath }` );
		process.exit( 1 );
	}
	const googleFontsFile = fs.readFileSync( filePath, 'utf8' );
	const googleFonts = JSON.parse( googleFontsFile );
	const families = googleFonts.font_families;
	const familiesCount = families.length;
	let familiesSuccessCount = 0;
	let familiesSkippedCount = 0;
	let facesSkippedCount = 0;
	let facesCount = 0;
	let facesSuccessCount = 0;
	const updatedFontFamilies = [];

	for ( let i = 0; i < familiesCount; i++ ) {
		const family = families[ i ].font_family_settings;
		const updatedFamily = { ...family, fontFace: [] };

		facesCount += family.fontFace.length;

		if ( excludedFontFamilies.includes( family.slug ) ) {
			familiesSkippedCount++;
			facesSkippedCount += family.fontFace.length;
			console.log(
				`🔨 Skipping SVG previews for ${ family.name } (${
					i + 1
				}/${ familiesCount })`
			);
			updatedFontFamilies.push( {
				...families[ i ],
				font_family_settings: family,
			} );
			continue;
		}

		try {
			console.log(
				`🔨 Generating SVG previews for ${ family.name } (${
					i + 1
				}/${ familiesCount })`
			);
			await generateFontFamilyPreview( family );
			updatedFamily.preview = getPreviewUrl( family, null, true );
			familiesSuccessCount++;
		} catch ( error ) {
			console.error(
				`❌ Error generating preview for ${ family.name }: ${ error }`
			);
		}

		for ( let x = 0; x < family.fontFace.length; x++ ) {
			const face = family.fontFace[ x ];
			try {
				await generateFontFacePreview( family, face );
				updatedFamily.fontFace.push( {
					...face,
					preview: getPreviewUrl( family, face, false ),
				} );
				facesSuccessCount++;
			} catch ( error ) {
				console.error(
					`❌ Error generating preview for ${ family.name } ${ face.fontWeight } ${ face.fontStyle }: ${ error }`
				);
			}
		}

		console.log( '' );

		updatedFontFamilies.push( {
			...families[ i ],
			font_family_settings: updatedFamily,
		} );
	}

	if ( familiesCount === familiesSuccessCount + familiesSkippedCount ) {
		console.log(
			`✅ Generated ${ familiesSuccessCount } of ${ familiesCount } SVG previews for font families. ${ familiesSkippedCount } were intentionally skipped.`
		);
	} else {
		console.warn(
			`⚠️ Generated ${ familiesSuccessCount } of ${ familiesCount } SVG previews font families. Check for errors.`
		);
	}
	if ( facesCount === facesSuccessCount + facesSkippedCount ) {
		// Creates a new google-fonts.json file with the previews.
		updateGoogleFontsFileWithPreviews( updatedFontFamilies );
		console.log(
			`✅ Generated ${ facesSuccessCount } SVG previews of ${ facesCount } font faces. ${ facesSkippedCount } were intentionally skipped.`
		);
	} else {
		console.warn(
			`⚠️ Generated ${ facesSuccessCount } SVG previews of ${ facesCount } font faces. Check for errors.`
		);
	}
}

// Run the script.
generatePreviews();
