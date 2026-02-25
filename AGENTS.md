# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Repository Overview

This repo contains Node scripts to generate the Google Fonts collection JSON files and associated font previews for the WordPress Font Library.

The generated JSON files are deployed to the w.org CDN and consumed by the Font Library in WordPress and the Gutenberg plugin.

Here are examples of the JSON files these scripts generate:

<https://s.w.org/images/fonts/wp-7.0/collections/google-fonts.json>
<https://s.w.org/images/fonts/wp-7.0/collections/google-fonts-with-preview.json>

See README.md for more details.

## Tech Stack

-   Node
-   Google Fonts API
-   WordPress

## Directory Structure

-   `src/`: Contains the Node scripts to generate the Google Fonts collection JSON files and associated font previews.
    -   `constants.js`: Configuration constants including the current release version and CDN base URL.
    -   `get_google_fonts.js`: Fetches font data from the Google Fonts API and transforms it to WordPress format.
    -   `download_google_font_assets.js`: Downloads font files from Google's servers.
    -   `generate_font_previews.js`: Generates SVG preview images and outputs the final JSON with preview URLs.
    -   `utils.js`: Shared utility functions.
-   `releases/`: Contains the generated JSON files and SVG previews, organized by release (e.g., `releases/wp-7.0/`).
    -   `releases/{version}/collections/google-fonts.json`: The main font collection file.
    -   `releases/{version}/collections/google-fonts-with-preview.json`: The font collection file with preview URLs.
    -   `releases/{version}/previews/`: The generated SVG preview images.
-   `font-assets/`: Downloaded font files used during preview generation. Gitignored — safe to delete.
-   `development-server.js`: Express server for testing the collection locally against a WordPress instance.
-   `README.md`: Contains the README file.
-   `LICENSE`: Contains the license file.
-   `package.json`: Contains the package dependencies.
-   `package-lock.json`: Contains the package lock file.

## Commands

```bash
# Fetch Google Fonts data and generate the Google Fonts collection JSON files.
# Requires the GOOGLE_FONTS_API_KEY environment variable.
GOOGLE_FONTS_API_KEY=your_key_here npm run api

# Download the font assets (optional — the previews step downloads them on-the-fly)
npm run files

# Generate the font previews and create google-fonts-with-preview.json.
# Downloads font assets automatically if not already present. Takes significant
# time (~1500 font families processed serially).
npm run previews

# Format the JSON files
npm run format

# Lint the code
npm run lint

# Update the package dependencies
npm run packages-update

# Start the development server on port 9158
npm run serve
```

For more details on how to use these commands, see README.md.

## Creating a New Release

Follow these steps in order when creating a new version of the font collection:

1.  Update `src/constants.js` with the new version:
    -   Set `CURRENT_RELEASE` to the new version string (e.g., `'wp-7.1'`).
    -   Set `SVG_PREVIEWS_BASE_URL` to the matching CDN path (e.g., `'https://s.w.org/images/fonts/wp-7.1/previews/'`).

2.  Fetch the font data from the Google Fonts API:

    ```bash
    GOOGLE_FONTS_API_KEY=your_key_here npm run api
    ```

    This generates `releases/{version}/collections/google-fonts.json`.

3.  Generate the SVG previews and final JSON:

    ```bash
    npm run previews
    ```

    This generates `releases/{version}/previews/` and `releases/{version}/collections/google-fonts-with-preview.json`. Expect this to take a long time.

4.  Test locally using the development server (`npm run serve`) and a local WordPress instance. See README.md for setup details.

5.  Commit the following files:
    -   `src/constants.js`
    -   `releases/{version}/collections/google-fonts.json`
    -   `releases/{version}/collections/google-fonts-with-preview.json`
    -   `releases/{version}/previews/` (all SVG files)

    Do not commit `font-assets/` — it is gitignored and only used as intermediate storage.

6.  After merge, a meta.trac ticket must be filed to host the files on the CDN, and a patch submitted to wordpress-develop to update the CDN URLs. These steps require human follow-up.

## Conventions to Follow

-   Use the WordPress coding standards.

## Common Pitfalls

-   API key: `npm run api` requires a `GOOGLE_FONTS_API_KEY` environment variable. You can create a key from the Google Cloud Console.
-   CDN caching: Never access a CDN URL (e.g., `https://s.w.org/images/fonts/...`) before the files have actually been deployed there. 404 responses are cached indefinitely.
-   Excluded fonts: Some fonts are skipped during preview generation due to rendering issues (icon fonts, certain scripts). If a new font causes `npm run previews` to fail, add its slug to the `excludedFontFamilies` array in `src/generate_font_previews.js`.
-   Step order: Always run `npm run api` before `npm run previews`. The previews script reads the JSON file produced by the API script.
-   `npm run files` is optional: The `npm run previews` script downloads font assets automatically. The `npm run files` command exists if you need the assets separately.
