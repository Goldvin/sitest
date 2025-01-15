const SHEET_ID = '1G1UjWN_ru3PdQf-qlKuwIT5CCfQSuA6reOzQZdu6FW8';
const API_KEY = 'AIzaSyAmOoWpQprHyZS97DiIXCdy2LFkAe0POa8';

export const urls = {
    navbar: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Navbar?key=${API_KEY}`,
    about: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/About?key=${API_KEY}`,
    lastUpdated: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Body!H1?key=${API_KEY}`,
    body: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Body?key=${API_KEY}`,
    header: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Header?key=${API_KEY}`,
    footer: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Footer?key=${API_KEY}`,
    services: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Services?key=${API_KEY}`,
    faq: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/FAQ?key=${API_KEY}`,
    metadata: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/FAQ_Metadata?key=${API_KEY}`,
    comments: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Comments?key=${API_KEY}`,
};
