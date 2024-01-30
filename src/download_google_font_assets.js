/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const { GOOGLE_FONTS_FILE, COLLECTIONS_FOLDER } = require( './constants' );
const { releasePath, downloadFile } = require( './utils' );

function getFamilies() {
	const googleFontsFile = fs.readFileSync(
		releasePath( `${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }` ),
		'utf8'
	);
	const googleFonts = JSON.parse( googleFontsFile );
	return googleFonts.font_families;
}

async function downloadFontFamilies() {
	const families = getFamilies();
	let facesCount = 0;
	let facesSuccessCount = 0;

	for ( let i = 0; i < families.length; i++ ) {
		// eslint-disable-next-line no-console
		console.info(
			`ℹ️  Downloading ${ families[ i ].font_family_settings.name } (${
				i + 1
			}/${ families.length })`
		);
		for (
			let x = 0;
			x < families[ i ].font_faces.length;
			x++
		) {
			facesCount++;

			const url =
				families[ i ].font_faces[ x ].font_face_settings[ 'src' ];
			const relativePath = url.replace(
				'https://fonts.gstatic.com/s/',
				''
			);
			const destPath = './' + path.join( 'font-assets/', relativePath );

			try {
				await downloadFile( url, destPath );
				facesSuccessCount++;
				// eslint-disable-next-line no-console
				console.log( `✅ Downloaded to ${ destPath }` );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( `❎  Failed to download ${ url }: ${ error }` );
			}
			// eslint-disable-next-line no-console
			console.log( '' );
		}
	}

	if ( facesCount === facesSuccessCount ) {
		// eslint-disable-next-line no-console
		console.log(
			`🏅  Downloaded ${ facesSuccessCount } of ${ facesCount } font faces.`
		);
	} else {
		// eslint-disable-next-line no-console
		console.warn(
			`🚩  Downloaded ${ facesSuccessCount } of ${ facesCount } font faces. Check for errors.`
		);
	}
}

downloadFontFamilies();
