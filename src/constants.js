// Google Fonts API constants
const API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?key=";
const API_KEY = process.env.GOOGLE_FONTS_API_KEY;
const GOOGLE_FONTS_CAPABILITY = "&capability=WOFF2";

// File paths
const GOOGLE_FONTS_FILE_PATH = "./releases/gutenberg-17.6/google-fonts.json";
const GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH = "./releases/gutenberg-17.6/google-fonts-with-preview.json";
const SVG_PREVIEWS_BASE_URL = "https://s.w.org/images/fonts/16.7/previews/";

// font-collection.json schema realted constants
const FONT_COLLECTION_SCHEMA_URL = "https://schemas.wp.org/trunk/font-collection.json";
const FONT_COLLECTION_SCHEMA_VERSION = 1;

module.exports = {
    API_URL,
    API_KEY,
    GOOGLE_FONTS_CAPABILITY,
    GOOGLE_FONTS_FILE_PATH,
    GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH,
    SVG_PREVIEWS_BASE_URL,
    FONT_COLLECTION_SCHEMA_URL,
    FONT_COLLECTION_SCHEMA_VERSION
};
