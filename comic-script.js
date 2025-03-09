const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.gocomics.com/calvinandhobbes/';
const START_DATE = new Date(2024, 2, 9);  
const NUM_COMICS = 15;  

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`; 
}

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
    const imgElement = $('.item-comic-image img');
    let imgUrl = imgElement.attr('src');

    return imgUrl ? imgUrl : null;
}

async function scrapeComics(startDate, count) {
    let comics = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
        let formattedDate = formatDate(currentDate);
        let comicUrl = `${BASE_URL}${formattedDate}`;

        console.log(`Fetching Comic for ${formattedDate}...`);
        const html = await fetchComicPage(comicUrl);

        if (!html) {
            console.log(`Skipping Comic for ${formattedDate} due to fetch error.`);
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }

        const imgUrl = extractComicImage(html);

        if (imgUrl) {
            comics.push({ date: formattedDate, image: imgUrl });
            console.log(`✅ Found comic for ${formattedDate}: ${imgUrl}`);
        } else {
            console.log(`⚠ No comic image found for ${formattedDate}`);
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }

    saveComicsToFile(comics);
}

function saveComicsToFile(comics) {
    const filePath = path.join(__dirname, 'comics.json');
    fs.writeFileSync(filePath, JSON.stringify(comics, null, 2));
    console.log(`📁 Saved ${comics.length} comics to comics.json`);
}

scrapeComics(START_DATE, NUM_COMICS); 
