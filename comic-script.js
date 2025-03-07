const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://xkcd.com/';
const START_COMIC = 2500;
const NUM_COMICS = 10;

async function fetchComicPage(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${url}: ${error.message}`);
        return null;
    }
}

function extractComicImage(html) {
    const $ = cheerio.load(html);
    const imgElement = $('#comic img');
    let imgUrl = imgElement.attr('src');

    return imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `https:${imgUrl}`) : null;
}

async function scrapeComics(start, count) {
    let comics = [];

    for (let i = 0; i < count; i++) {
        const comicNumber = start + i;
        const comicUrl = `${BASE_URL}${comicNumber}/`;

        console.log(`Fetching Comic #${comicNumber}...`);
        const html = await fetchComicPage(comicUrl);

        if (!html) {
            console.log(`Skipping Comic #${comicNumber} due to fetch error.`);
            continue;
        }

        const imgUrl = extractComicImage(html);

        if (imgUrl) {
            comics.push({ comicNumber, images: [imgUrl] });
            console.log(`✅ Comic #${comicNumber} found: ${imgUrl}`);
        } else {
            console.log(`⚠ No comic image found for #${comicNumber}`);
        }
    }

    saveComicsToFile(comics);
}

function saveComicsToFile(comics) {
    const filePath = path.join(__dirname, 'comics.json');
    fs.writeFileSync(filePath, JSON.stringify(comics, null, 2));
    console.log(`📁 Saved ${comics.length} comics to comics.json`);
}

scrapeComics(START_COMIC, NUM_COMICS);
