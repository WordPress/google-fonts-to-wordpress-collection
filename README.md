# Google Fonts collection to WordPress Font Library collection


This is a prototype repo to test some ideas for font preview generation for the new WordPress Font Library.

## What?

The code on this repo:
- Gets a copy of the list of fonts provided by Google Fonts API.
- Transform the list provided by Google Fonts API in a WordPress `theme.json` like format to be compatible with the new WordPress Font Library collections.
- Downloads each one of the font assets for the 1500+ families available.
- Uses the font face downloaded assets to generate SVG format images with the font previews.
- Generates a new JSON file, including the preview images link.

## Instructions
Install the NPM dependencies:
```
npm install
```


- Gets a copy of the list of fonts provided by Google Fonts API.
- Transform the list provided by Google Fonts API in a WordPress `theme.json` like format to be compatible with the new WordPress Font Library collections.
```
GOOGLE_FONTS_API_KEY=abc123 npm run API
```


- Downloads each one of the font assets for the 1500+ families available.
```
npm run files
```


- Uses the font face downloaded assets to generate SVG format images with the font previews.
- Generates a new JSON file, including the preview images link.
```
npm run previews
```

## Requierements
- NodeJS 18+
- A Google Fonts API key
