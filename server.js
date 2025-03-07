const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

let comics = [];

function loadComics() {
    try {
        const data = fs.readFileSync('comics.json', 'utf8');
        comics = JSON.parse(data);
    } catch (error) {
        console.error('Error reading comics.json:', error);
        comics = [];
    }
}

// Initial load
loadComics();

app.get('/:index?', (req, res) => {
    let index = parseInt(req.params.index, 10) || 0;

    if (comics.length === 0) {
        return res.render('index', { comic: null, prevIndex: null, nextIndex: null });
    }

    if (index < 0) index = 0;
    if (index >= comics.length) index = comics.length - 1;

    const comic = comics[index] || null;
    const prevIndex = index > 0 ? index - 1 : null;
    const nextIndex = index < comics.length - 1 ? index + 1 : null;

    res.render('index', { comic, prevIndex, nextIndex });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
