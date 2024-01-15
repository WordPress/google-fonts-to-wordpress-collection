// Google Fonts API constants
const API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?key=";
const API_KEY = process.env.GOOGLE_FONTS_API_KEY;

// File paths
const DOWNLOAD_FOLDER = "font-assets";
const PREVIEWS_FOLDER = "previews";
const GOOGLE_FONTS_FILE = "google-fonts.json";
const GOOGLE_FONTS_WITH_PREVIEWS_FILE = "google-fonts-with-preview.json";
const SVG_PREVIEWS_BASE_URL = "https://s.w.org/images/fonts/16.7/previews/";

// font-collection.json schema realted constants
const FONT_COLLECTION_SCHEMA_URL = "https://schemas.wp.org/trunk/font-collection.json";
const FONT_COLLECTION_SCHEMA_VERSION = 1;

// Current Release
CURRENT_RELEASE = "gutenberg-17.6";

module.exports = {
    API_URL,
    API_KEY,
    DOWNLOAD_FOLDER,
    PREVIEWS_FOLDER,
    GOOGLE_FONTS_FILE,
    GOOGLE_FONTS_WITH_PREVIEWS_FILE,
    SVG_PREVIEWS_BASE_URL,
    FONT_COLLECTION_SCHEMA_URL,
    FONT_COLLECTION_SCHEMA_VERSION,
    CURRENT_RELEASE
};
