const API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?key=";
const API_KEY = process.env.GOOGLE_FONTS_API_KEY;
const GOOGLE_FONTS_FILE_PATH = "./output/google-fonts.json";
const GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH = "./output/google-fonts-with-previews.json";

module.exports = {
    API_URL,
    API_KEY,
    GOOGLE_FONTS_FILE_PATH,
    GOOGLE_FONTS_WITH_PREVIEWS_FILE_PATH,
};
