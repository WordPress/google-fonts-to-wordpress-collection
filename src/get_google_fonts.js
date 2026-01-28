/* eslint-disable no-console */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const crypto = require( 'crypto' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const {
	API_URL,
	API_KEY,
	GOOGLE_FONTS_CAPABILITY,
	GOOGLE_FONTS_FILE,
	COLLECTIONS_FOLDER,
	FONT_COLLECTION_SCHEMA_URL,
} = require( './constants' );
const { releasePath, stringify } = require( './utils' );

function formatCategoryName( slug ) {
	return (
		slug
			// Split the string into an array of words
			.split( '-' )
			// Capitalize the first letter of each word
			.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
			// Join the words back into a single string, separated by spaces
			.join( ' ' )
	);
}

function getCategories( fonts ) {
	const categorySlugs = new Set();
	fonts.forEach( ( font ) => {
		categorySlugs.add( font.category );
	} );
	// Returs an array of categories
	const categories = [ ...categorySlugs ].map( ( slug ) => ( {
		name: formatCategoryName( slug ),
		slug,
	} ) );
	return categories;
}

function calculateHash( somestring ) {
	return crypto
		.createHash( 'md5' )
		.update( somestring )
		.digest( 'hex' )
		.toString();
}

// Google Fonts API categories mappping to fallback system fonts
const GOOGLE_FONT_FALLBACKS = {
	display: 'system-ui',
	'sans-serif': 'sans-serif',
	serif: 'serif',
	handwriting: 'cursive',
	monospace: 'monospace',
};

function getStyleFromGoogleVariant( variant ) {
	return variant.includes( 'italic' ) ? 'italic' : 'normal';
}

function getWeightFromGoogleVariant( variant ) {
	return variant === 'regular' || variant === 'italic'
		? '400'
		: variant.replace( 'italic', '' );
}

function getFallbackForGoogleFont( googleFontCategory ) {
	return GOOGLE_FONT_FALLBACKS[ googleFontCategory ] || 'system-ui';
}

function httpToHttps( url ) {
	return url.replace( 'http://', 'https://' );
}

function getFontFamilyFromGoogleFont( font ) {
	return {
		font_family_settings: {
			name: font.family,
			fontFamily: `${ font.family }, ${ getFallbackForGoogleFont(
				font.category
			) }`,
			slug: font.family.replace( /\s+/g, '-' ).toLowerCase(),
			fontFace: font.variants.map( ( variant ) => ( {
				src: httpToHttps( font.files?.[ variant ] ),
				fontWeight: getWeightFromGoogleVariant( variant ),
				fontStyle: getStyleFromGoogleVariant( variant ),
				fontFamily: font.family,
			} ) ),
		},
		categories: [ font.category ],
	};
}

async function updateFiles() {
	console.log( '🔨 Fetching the Google Fonts API...\n' );

	const newApiData = await fetch(
		`${ API_URL }${ API_KEY }${ GOOGLE_FONTS_CAPABILITY }`
	);

	const response = await newApiData.json();

	if ( ! newApiData.ok ) {
		const errorMessage =
			response?.error?.message ||
			response?.message ||
			'Unknown error response from Google Fonts API.';
		console.error(
			'❌ Error fetching the Google Fonts API:',
			errorMessage
		);
		process.exit( 1 );
	}

	const fontFamilies = response.items.map( getFontFamilyFromGoogleFont );
	const categories = getCategories( response.items );

	// The data to be written to the file
	const newData = {
		$schema: FONT_COLLECTION_SCHEMA_URL,
		font_families: fontFamilies,
	};

	if ( ! response.items ) {
		console.error( '❌ No fonts found in the Google Fonts API.' );
		process.exit( 1 );
	}

	const newDataString = stringify( newData );

	// If the file doesn't exist, create it
	const filePath = releasePath(
		`${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }`
	);
	if ( ! fs.existsSync( filePath ) ) {
		fs.mkdirSync( path.dirname( filePath ), {
			recursive: true,
		} );
		fs.writeFileSync( filePath, '{}' );
		console.log( `✅ Created the ${ filePath } file.\n` );
	}

	const oldFileData = fs.readFileSync(
		releasePath( `${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }` ),
		'utf8'
	);
	const oldData = JSON.parse( oldFileData );
	const oldDataString = stringify( oldData );

	if ( calculateHash( newDataString ) !== calculateHash( oldDataString ) ) {
		fs.writeFileSync(
			releasePath( `${ COLLECTIONS_FOLDER }/${ GOOGLE_FONTS_FILE }` ),
			newDataString
		);
		console.info( '✅ Google Fonts JSON file updated.\n' );
		console.info(
			'✅ These are the categories collected:',
			categories,
			'\n'
		);
	} else {
		console.info( '✅ Google Fonts JSON file is up to date.\n' );
	}
}

updateFiles();
