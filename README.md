# Google Fonts collection to WordPress Font Library collection

Node scripts to generate the Google Fonts collection json and associated font previews for the WordPress Font Library.

## What?

The code on this repo:
- Gets a copy of the list of fonts provided by Google Fonts API.
- Transforms the list provided by Google Fonts API into a WordPress `theme.json` like format to be compatible with the new WordPress Font Library collections.
- Downloads each one of the font assets for the 1500+ families available.
- Uses the font face downloaded assets to generate SVG format images with the font previews.
- Generates a new JSON file, including the preview images link.

## Instructions

Install the NPM dependencies:

```
npm install
```
---

```
GOOGLE_FONTS_API_KEY=abc123 npm run api
```

- Gets a copy of the list of fonts provided by Google Fonts API.
- Transforms the list provided by Google Fonts API into a WordPress `theme.json` like format to be compatible with the new WordPress Font Library collections.

---

```
npm run previews
```

- Iterates over the list of font families and for each one:
- Downloads the font family assets.
- Uses the font face downloaded assets to generate SVG format images with the font previews.
- Generates a new JSON file, including the preview images link.

### Development server

To serve the fonts from a development server for testing on a local WordPress site:

Start the development server from this repo

```
npm run serve
```

Add the following filters to an mu-plugin running on your local WordPress site (e.g. `wp-content/mu-plugins/0-local.php`). Update the version variables, if needed:

- `$wp_release_fonts_version` version in the collection url your local site is running
  - Check `wp_register_font_collection` in `wp-includes/fonts.php`
  - e.g. A `font_families` url of `https://s.w.org/images/fonts/wp-6.5/collections/google-fonts-with-preview.json` means a `$wp_release_fonts_version` of `6.5`
- `$gutenberg_release_fonts_version` version of the collection url from Gutenberg (if Gutenberg is loading a newer version of the collection)
  - Check for `wp_register_font_collection( 'google-fonts', ...` [in the Gutenberg repo](https://github.com/search?q=repo:WordPress/gutenberg+wp_register_font_collection(+'google-fonts'&type=code
)
  - e.g. A `font_families` url of `https://s.w.org/images/fonts/17.7/collections/google-fonts-with-preview.json` means a `$gutenberg_release_fonts_version` of `17.7`
- `$generated_fonts_version` version of fonts generated in this repo you would like to serve
  - e.g if the fonts are in a folder `releases/gutenberg-18.2`, the `$generated_fonts_version` should be `18.2`
  - For fonts in `releases/wp-6.6`, `$generated_fonts_version` should be `6.6`

```php
// Rewrite Google Fonts URLs to localhost.
function my_local_google_fonts_collection( $pre, $args, $url ) {
	$wp_release_fonts_version = '6.5';
	$gutenberg_release_fonts_version = '17.7';
	$generated_fonts_version = '18.2';

	if ( str_starts_with( $url, 'https://s.w.org/images/fonts/' ) ) {
		$url = str_replace( "https://s.w.org/images/fonts/wp-$wp_release_fonts_version", "http://localhost:9158/images/fonts/$generated_fonts_version", $url );
		$url = str_replace( "https://s.w.org/images/fonts/$gutenberg_release_fonts_version", "http://localhost:9158/images/fonts/$generated_fonts_version", $url );
		$http = new WP_Http();
		return $http->request( $url, $args );
	}

	return $pre;
}
add_filter( 'pre_http_request', 'my_local_google_fonts_collection', 10, 3 );

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

The local WordPress site should now load fonts from this repo. You can check by loading the Font Library in the site editor and looking at the log output from `npm run serve`.

## Extra utilities:

Download all the font files
---

```
npm run files
```

- Downloads each one of the font assets for the 1500+ families available.

## Requirements

- NodeJS 18+
- A Google Fonts API key

## Creating a new version of the font collection

Update the `CURRENT_RELEASE` and `SVG_PREVIEWS_BASE_URL` constants in `src/constant.js` with the new version.

- e.g. For Gutenberg 18.2, `const CURRENT_RELEASE = '18.2'` and `const SVG_PREVIEWS_BASE_URL = 'https://s.w.org/images/fonts/18.2/previews/'`
- e.g. For WordPress 6.6,  `const CURRENT_RELEASE = 'wp-6.6'` and `const SVG_PREVIEWS_BASE_URL = 'https://s.w.org/images/fonts/wp-6.6/previews/'`

Generate a new version of the collection using the commands above, generate new previews if needed, and open a PR with the change.

Once the PR is merged to trunk, the collection can be uploaded to the s.wp.org CDN by submitting a meta ticket, for example: https://meta.trac.wordpress.org/ticket/7522
