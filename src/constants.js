const API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?key=";
const API_KEY = process.env.GOOGLE_FONTS_API_KEY;
const GOOGLE_FONTS_FILE_PATH = "./output/google-fonts.json";
const GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH = "./output/google-fonts-with-preview.json";
const SVG_PREVIEWS_BASE_URL = "https://raw.githubusercontent.com/matiasbenedetto/google-fonts-to-wordpress-collection/main/output/previews/";

module.exports = {
    API_URL,
    API_KEY,
    GOOGLE_FONTS_FILE_PATH,
    GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH,
    SVG_PREVIEWS_BASE_URL
};
