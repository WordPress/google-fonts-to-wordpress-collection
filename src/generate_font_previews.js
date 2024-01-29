/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const TextToSVG = require( 'text-to-svg' );
const woff2 = require( 'woff2' );

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

function getFamilies() {
	const googleFontsFile = fs.readFileSync(
		releasePath( `${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }` ),
		'utf8'
	);
	const googleFonts = JSON.parse( googleFontsFile );
	return googleFonts.font_families;
}

function updateGoogleFontsFileWithPreviews( newFontFamilies ) {
	const googleFontsFile = fs.readFileSync(
		releasePath( `${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }` ),
		'utf8'
	);
	const content = JSON.parse( googleFontsFile );
	content.font_families = newFontFamilies;
	fs.writeFileSync(
		releasePath( `${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_WITH_PREVIEWS_FILE }` ),
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
  * @return {TextToSVG} - The TextToSVG instance.
*/
function loadFontToTextToSVG( fontAssetPath ) {
	if ( fontAssetPath.endsWith( '.woff2' ) ) {
		// Decodes WOFF2 font asset.
		const fileData = fs.readFileSync( fontAssetPath );
		// Writes a temporary ttf file.
		const ttfFontAssetPath = fontAssetPath.replace( '.woff2', '.ttf' );
		fs.writeFileSync( ttfFontAssetPath, woff2.decode( fileData ) );
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
	const localFontPath = face.src.replace(
		'https://fonts.gstatic.com/s',
		downloadFolder
	);

	// Downloads font asset if it doesn't exist and if its not empty.
	if ( ! fs.existsSync( localFontPath ) ) {
		await downloadFile( face.src, localFontPath );
	}

	// Loads font asset.
	const fontAssetPath = face.src.replace(
		'https://fonts.gstatic.com/s',
		downloadFolder
	);

	// Loads font asset to TextToSVG instance.
	const textToSVG = loadFontToTextToSVG( fontAssetPath );

	// Generates SVG.
	const attributes = { fill: 'black' };
	const options = {
		x: 0,
		y: 0,
		fontSize: 24,
		anchor: 'top',
		attributes: attributes,
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
	
	// eslint-disable-next-line no-console
	console.log( `✅ Generated ${ svgPath }` );
}

async function generateFontFamilyPreview( fontFamily, fontFamilySettings ) {
	// Select the font face to make the preview (try to get 400, normal if it's there)
	const face =
	fontFamily.font_faces.find(
			( face ) => face.font_face_settings.fontWeight === '400' && face.font_face_settings.fontStyle === 'normal'
		) || fontFamily.font_faces[ 0 ];
	await generateFontFacePreview( fontFamilySettings, face.font_face_settings, true );
}

async function generatePreviews() {
	const families = getFamilies();
	const familiesCount = families.length;
	let familiesSuccessCount = 0;
	let facesCount = 0;
	let facesSuccessCount = 0;
	const updatedFontFamilies = [];

	for ( let i = 0; i < families.length; i++ ) {
		const fontFamily = families[ i ];
		const fontFamilySettings = families[ i ].font_family_settings;
		const fontFaces = families[ i ].font_faces;
		const updatedFamily = { ...fontFamily, font_faces: [] };

		try {
			// eslint-disable-next-line no-console
			console.log(
				`ℹ️  Generating SVG previews for ${ fontFamilySettings.name } (${ i + 1 }/${
					families.length
				})`
			);
			await generateFontFamilyPreview( fontFamily, fontFamilySettings );
			updatedFamily.preview = getPreviewUrl( fontFamilySettings, null, true );
			familiesSuccessCount++;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error(
				`❎  Error generating preview for ${ fontFamilySettings.name }: ${ error }`
			);
		}

		for ( let x = 0; x < fontFaces.length; x++ ) {
			facesCount++;
			const face = fontFaces[ x ].font_face_settings;
			try {
				generateFontFacePreview( fontFamilySettings, face );
				updatedFamily.font_faces.push( {
					font_face_settings: face,
					preview: getPreviewUrl( fontFamilySettings, face, false ),
				} );
				facesSuccessCount++;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error(
					`❎  Error generating preview for ${ fontFamilySettings.name } ${ face.fontWeight } ${ face.fontStyle }: ${ error }`
				);
			}
		}

		updatedFontFamilies.push( {
			...families[ i ],
			preview: updatedFamily.preview,
			font_faces: updatedFamily.font_faces,
		} );
	}

	if ( familiesCount === familiesSuccessCount ) {
		// eslint-disable-next-line no-console
		console.log(
			`🏅  Generated ${ familiesSuccessCount } of ${ familiesCount } SVG previess for font families.`
		);
	} else {
		// eslint-disable-next-line no-console
		console.warn(
			`🚩  Generated ${ familiesSuccessCount } of ${ familiesCount } SVG previews font families. Check for errors.`
		);
	}

	if ( facesCount === facesSuccessCount ) {
		// Creates a new google-fonts.json file with the previews.
		updateGoogleFontsFileWithPreviews( updatedFontFamilies );
		// eslint-disable-next-line no-console
		console.log(
			`🏅  Generated ${ facesSuccessCount } of ${ facesCount } SVG previews for font faces.`
		);
	} else {
		// eslint-disable-next-line no-console
		console.warn(
			`🚩  Generated ${ facesSuccessCount } of ${ facesCount } SVG previews for font faces. Check for errors.`
		);
	}
}

// Run on script termination.
function processExitHandler() {
	// eslint-disable-next-line no-console
	console.log(
		'---------------------------------------------------------------------'
	);
	// eslint-disable-next-line no-console
	console.error(
		`❎ Script terminated. The previews files generated were not added to ${ GOOGLE_FONTS_WITH_PREVIEWS_FILE } file.`
	);
	// eslint-disable-next-line no-console
	console.log(
		'---------------------------------------------------------------------'
	);
	process.exit();
}

// Run on manual process interruption.
process.on( 'SIGINT', processExitHandler );
process.on( 'SIGTERM', processExitHandler );

// Run the script.
generatePreviews();
