# Google Fonts collection to WordPress Font Library collection

This repo contains node.js scripts to generate the Google Fonts collection JSON files and associated font previews for the WordPress Font Library.

The generated JSON files are deployed to the w.org CDN and consumed by the Font Library in WordPress and the Gutenberg plugin.

Here are examples of the JSON files these scripts generate:

-   <https://s.w.org/images/fonts/17.7/collections/google-fonts.json>
-   <https://s.w.org/images/fonts/17.7/collections/google-fonts-with-preview.json>

## What is the purpose of this repo?

The code in this repo:

-   Gets a copy of the list of fonts provided by Google Fonts API.
-   Transforms the list provided by Google Fonts API into a WordPress `theme.json` like format to be compatible with the new WordPress Font Library collections.
-   Downloads each one of the font assets for the 1500+ families available.
-   Uses the font face downloaded assets to generate SVG format images with the font previews.
-   Generates a new JSON file, including the preview images link.

## Requirements

-   NodeJS 22+
-   A Google Fonts API key: Create a key on [the credentials page](https://console.cloud.google.com/apis/credentials).

## How to setup

This repository is quite large, so when cloning it locally, we recommend using a shallow clone with the `--depth=1` option:

```bash
git clone --depth=1 https://github.com/WordPress/google-fonts-to-wordpress-collection.git
```

Install the NPM dependencies:

```bash
npm install
```

## Creating a new version of the font collection

To host a new font collection for the Font Library in alignment with a WordPress major release, please follow the steps below:

### 1. Create a core ticket

Create a tracking ticket to manage various tasks. The [64564 ticket](https://core.trac.wordpress.org/ticket/64564) is an example of this for the WordPress 7.0 release.

### 2. Set the new release version

First, Update the `CURRENT_RELEASE` and `SVG_PREVIEWS_BASE_URL` constants in `src/constant.js` with the new release version. e.g. For WordPress 7.0, `const CURRENT_RELEASE = 'wp-7.0'` and `const SVG_PREVIEWS_BASE_URL = 'https://s.w.org/images/fonts/wp-7.0/previews/'`.

### 3. Fetch Google Fonts Data

Fetches font data from the Google Fonts API and converts it to a WordPress `theme.json` like format to be compatible with the new WordPress Font Library collections. Create a Google API key on [the credentials page](https://console.cloud.google.com/apis/credentials) and set it as the `GOOGLE_FONTS_API_KEY` environment variable:

```bash
GOOGLE_FONTS_API_KEY={YOUR_GOOGLE_FONTS_API_KEY} npm run api
```

On Windows (PowerShell), set the environment variable and run the command as follows:

```powershell
$env:GOOGLE_FONTS_API_KEY = "{YOUR_GOOGLE_FONTS_API_KEY}"; npm run api
```

This script will create a new `releases/{wp-X.X}/collections/google-fonts.json` file.

**Note: Never expose your Google API key publicly or commit it to this repository.**

### 4. Generate SVG Previews for Google Fonts

Generates SVG preview images for each font family and font face from the Google Fonts collection. The script iterates over the list of font families, downloads the font assets, uses them to generate SVG preview images, and creates a new JSON file with preview image links. The updated JSON file is saved as `releases/{wp-X.X}/collections/google-fonts-with-preview.json`.

```bash
npm run previews
```

Note that this command may take some time, as it generates a large number of font previews.

If the font preview fails to generate due to a possibly corrupted font, consider adding the file to the `excludedFontFamilies` variable defined in the `src/generate_font_previews.js` file.

### 5. Create a PR

Now you're ready to create a pull request. The modified files/directory should look like this, commit them, and submit the PR:

-   Modifiled:
    -   `src/constants.js`
-   Created:
    -   `releases/{wp-X.X}/collections/google-fonts.json`
    -   `releases/{wp-X.X}/collections/google-fonts-with-preview.json`
    -   `releases/{wp-X.X}/previews/*`

Note that `releases/{wp-X.X}/font-assets/*` is gitignored. The ~font-assets` directory contains intermediate files used only for generating SVG previews.

### 6. Test the PR

New releases added via PR can be tested on a local site. To serve the fonts from a development server for testing on a local WordPress site, start the development server from this repo. e.g. For WordPress 7.0, you can check the fonts served with `http://localhost:9158/images/fonts/wp-7.0/collections/google-fonts-with-preview.json`:

```bash
npm run serve
```

Add the following filters to an mu-plugin running on your local WordPress site (e.g. `wp-content/mu-plugins/0-local.php`). These codes register a new font collection based on the new fonts served from the development server and grant it access to the development server.

Note that you need to update the `$fonts_version` with the new version. e.g. For WordPress 7.0, `$fonts_version` should be `wp-7.0`.

```php
// Register new Google Fonts font collection
function test_new_google_fonts_font_collection() {
	// Replace with the new version. e.g. 'wp-7.0'.
	$fonts_version = 'wp-7.0';
	wp_register_font_collection(
		'new-google-fonts',
		array(
			'name'          => 'New Google Fonts',
			'description'   => 'These font collections are served from a local server for testing purposes.',
			'font_families' => 'http://localhost:9158/images/fonts/' . $fonts_version . '/collections/google-fonts-with-preview.json',
			'categories'    => array(
				array( 'name' => 'Sans Serif',  'slug' => 'sans-serif' ),
				array( 'name' => 'Display',     'slug' => 'display' ),
				array( 'name' => 'Serif',       'slug' => 'serif' ),
				array( 'name' => 'Handwriting', 'slug' => 'handwriting' ),
				array( 'name' => 'Monospace',   'slug' => 'monospace' ),
			),
		)
	);
}
add_action( 'init', 'test_new_google_fonts_font_collection' );

// Allow serving fonts locally for testing.
function my_allow_localhost( $allow, $host, $url ) {
	if ( str_starts_with( $url, 'http://localhost:9158/images/fonts/' ) ) {
		$allow = true;
	}
	return $allow;
}
add_filter( 'http_request_host_is_external', 'my_allow_localhost', 10, 3 );

// Allow port 9158 for local fonts server.
function my_allow_http_ports( $ports ) {
	$ports[] = 9158;
	return $ports;
}
add_filter( 'http_allowed_safe_ports', 'my_allow_http_ports' );
```

This will add the new font collection to your local WordPress site. You can now access the new fonts by visiting the Appearance > Fonts menu and under the `New Google Fonts` tab.

In particular, check the following for newly added fonts:

-   Is the preview displayed correctly?
-   Is the number of variations correct?
-   Does it install correctly?
-   Once activated, does the font display correctly on the front-end and in the editor?

You can see the list of new fonts with the following command. Remember to replace `{NEW_RELEASE}` and `{PREVIOUS_RELEASE}` with the correct version. e.g. For WordPress 7.0, `{NEW_RELEASE}` should be `wp-7.0` and `{PREVIOUS_RELEASE}` should be `wp-6.9`.

```bash
comm -23 <(jq -r '.font_families[].font_family_settings.name' releases/{NEW_RELEASE}/collections/google-fonts-with-preview.json | sort) <(jq -r '.font_families[].font_family_settings.name' releases/{PREVIOUS_RELEASE}/collections/google-fonts-with-preview.json | sort)
```

### 7. Host fonts via CDN

Once the PR is merged, submit a meta ticket to host the font list on the GitHub repository, for example: [https://meta.trac.wordpress.org/ticket/8172](https://meta.trac.wordpress.org/ticket/8172)

**Note: Do not access or link to the collection/preview URLs until the fonts are hosted on the CDN. The CDN caches 404 responses indefinitely, which can cause issues.**

### 8. Submit a core patch

Create a PR to apply the new published URL to WordPress core. Search the entire `wordpress-develop` repository for the previous URL and replace it with the new URL. e.g. For WordPress 7.0, search for `fonts/wp-6.9` and replace it with `fonts/wp-7.0`. The [Pull request #10891](https://github.com/WordPress/wordpress-develop/pull/10891) is an example of this for the WordPress 7.0 release.

Also, as in [STEP 6](#6-test-the-pr), please make sure that the new fonts are working properly.

-   Is the preview displayed correctly?
-   Is the number of variations correct?
-   Does it install correctly?
-   Once activated, does the font display correctly on the front-end and in the editor?

## Extra Utilities

### Download all the font files

Downloads font files for all font families and font faces listed in the Google Fonts collection JSON to the `font-assets/` directory:

```bash
npm run files
```

Note that this command may take some time, as it downloads a large number of font files.
