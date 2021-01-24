const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
    let bibleData = {
        books: [],
        lookup: {}
    };

    // Load all the books
    const bookStream = fs.createReadStream('books.csv');
    const bl = readline.createInterface({
        input: bookStream,
        crlfDelay: Infinity
    });
    for await (const book of bl) {
        // BookID, OsisID, BookName, TotalChapters, Volume
        let bookData = book.split(',');
        bibleData.books.push({
            name: bookData[2],
            OsisID: bookData[1],
            volume: bookData[4],
            aliases: [],
            chapterCount: parseInt(bookData[3], 10),
            chapters: []
        });
        // Keep the lookout zero-based
        bibleData.lookup[bookData[2]] = (parseInt(bookData[0], 10) - 1);
    }
  
    const aliasStream = fs.createReadStream('aliases.csv');
    const al = readline.createInterface({
        input: aliasStream,
        crlfDelay: Infinity
    });
    for await (const alias of al) {
        // BookID, Alias
        let aliasData = alias.split(',');
        bibleData.books[parseInt(aliasData[0], 10)-1].aliases.push(aliasData[1]);
    }

    const chapterStream = fs.createReadStream('chapters.csv');
    const cl = readline.createInterface({
        input: chapterStream,
        crlfDelay: Infinity
    });
    for await (const chapter of cl) {
        // BookID, Chapter, TotalVerses, WordCountKjv, ReadingTimeInSecondsKjvScourby
        let chapterData = chapter.split(',');
        bibleData.books[parseInt(chapterData[0], 10)-1].chapters.push({
            number: parseInt(chapterData[1], 10),
            verseCount: parseInt(chapterData[2], 10)
        });
    }

    fs.writeFileSync('bible.json', JSON.stringify(bibleData));
}

processLineByLine();