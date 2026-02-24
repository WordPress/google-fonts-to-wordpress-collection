/**
 * E2E validation tests for the generated font collection release.
 *
 * Run after `npm run api` and `npm run previews` to verify the output is correct.
 *
 * Usage: npm test
 */

const test = require( 'node:test' );
const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );

const { CURRENT_RELEASE } = require( '../src/constants.js' );

const releasesDir = path.resolve(
	__dirname,
	'..',
	'releases',
	CURRENT_RELEASE
);
const collectionsDir = path.join( releasesDir, 'collections' );
const googleFontsPath = path.join( collectionsDir, 'google-fonts.json' );
const googleFontsWithPreviewPath = path.join(
	collectionsDir,
	'google-fonts-with-preview.json'
);
const previewsDir = path.join( releasesDir, 'previews' );

// Parse the JSON files once and share across tests.
let googleFonts;
let googleFontsWithPreview;

test( 'google-fonts.json exists', () => {
	assert.ok(
		fs.existsSync( googleFontsPath ),
		`Expected file to exist: ${ googleFontsPath }`
	);
} );

test( 'google-fonts.json parses as valid JSON', () => {
	const raw = fs.readFileSync( googleFontsPath, 'utf8' );
	googleFonts = JSON.parse( raw );
} );

test( 'google-fonts.json has $schema and font_families array with at least 1 entry', () => {
	assert.ok( googleFonts.$schema, 'Missing $schema' );
	assert.ok(
		Array.isArray( googleFonts.font_families ),
		'font_families must be an array'
	);
	assert.ok(
		googleFonts.font_families.length >= 1,
		'font_families must have at least 1 entry'
	);
} );

test( 'first font family has required fields', () => {
	const family = googleFonts.font_families[ 0 ];
	const settings = family?.font_family_settings;

	assert.ok( settings?.name, 'Missing font_family_settings.name' );
	assert.ok(
		settings?.fontFamily,
		'Missing font_family_settings.fontFamily'
	);
	assert.ok( settings?.slug, 'Missing font_family_settings.slug' );
	assert.ok(
		Array.isArray( settings?.fontFace ) && settings.fontFace.length >= 1,
		'font_family_settings.fontFace must be a non-empty array'
	);
	assert.ok(
		Array.isArray( family?.categories ) && family.categories.length >= 1,
		'categories must be a non-empty array'
	);
} );

test( 'first font face has required fields', () => {
	const fontFace =
		googleFonts.font_families[ 0 ].font_family_settings.fontFace[ 0 ];

	assert.ok( fontFace.src, 'Missing fontFace.src' );
	assert.ok( fontFace.fontWeight, 'Missing fontFace.fontWeight' );
	assert.ok( fontFace.fontStyle, 'Missing fontFace.fontStyle' );
	assert.ok( fontFace.fontFamily, 'Missing fontFace.fontFamily' );
} );

test( 'google-fonts-with-preview.json exists', () => {
	assert.ok(
		fs.existsSync( googleFontsWithPreviewPath ),
		`Expected file to exist: ${ googleFontsWithPreviewPath }`
	);
} );

test( 'google-fonts-with-preview.json parses as valid JSON', () => {
	const raw = fs.readFileSync( googleFontsWithPreviewPath, 'utf8' );
	googleFontsWithPreview = JSON.parse( raw );
} );

test( 'first font family in with-preview file has a preview string on font_family_settings', () => {
	const settings =
		googleFontsWithPreview.font_families[ 0 ]?.font_family_settings;

	assert.equal(
		typeof settings?.preview,
		'string',
		'font_family_settings.preview must be a string'
	);
	assert.ok(
		settings.preview.length > 0,
		'font_family_settings.preview must not be empty'
	);
} );

test( 'first font face in with-preview file has a preview string', () => {
	const fontFace =
		googleFontsWithPreview.font_families[ 0 ]?.font_family_settings
			?.fontFace?.[ 0 ];

	assert.equal(
		typeof fontFace?.preview,
		'string',
		'fontFace.preview must be a string'
	);
	assert.ok(
		fontFace.preview.length > 0,
		'fontFace.preview must not be empty'
	);
} );

test( 'preview SVG file for the first font family exists on disk', () => {
	const {
		slug,
	} = googleFontsWithPreview.font_families[ 0 ].font_family_settings;
	const svgPath = path.join( previewsDir, slug, `${ slug }.svg` );

	assert.ok(
		fs.existsSync( svgPath ),
		`Expected SVG to exist: ${ svgPath }`
	);
} );

test( 'preview SVG file for the first font face exists on disk', () => {
	const {
		slug,
		fontFace,
	} = googleFontsWithPreview.font_families[ 0 ].font_family_settings;
	const { fontWeight, fontStyle } = fontFace[ 0 ];
	const svgName = `${ slug }-${ fontWeight }-${ fontStyle }.svg`;
	const svgPath = path.join( previewsDir, slug, svgName );

	assert.ok(
		fs.existsSync( svgPath ),
		`Expected SVG to exist: ${ svgPath }`
	);
} );
