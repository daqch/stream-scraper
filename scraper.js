const puppeteer = require('puppeteer');
require('dotenv').config();
const pg = require ('pg');

const scrap = async (streamers, platforms, client) => {
    // for each streamer, scrape their stream
    // we are only interested in the number of viewers
    const browser = await puppeteer.launch();
    // for each streamer, scrape their stream
    for (let i = 0; i < streamers.length; i++) {
        // open a new browser window
        const platform = platforms[streamers[i].platform];
        const page = await browser.newPage();
        // navigate to the streamer's page
        try {
        await page.goto(streamers[i].url);
        } catch (e) {
            // the page doesn't exist or it can't be reached
            // we can't scrape this streamer
            console.log(`${streamers[i].name} can't be reached`);
            continue;
        }
        try {
            await page.waitForXPath(platform.xpath, {timeout: 5000});
        } catch (e) {
            // the streamer is offline or the xpath is wrong
            console.log(`${streamers[i].name} is offline`);
            continue;
        }
        // the streamer is online and the xpath is correct
        // get the number of viewers and the game they are playing
        // and create a new entry in the database
        const [viewers] = await page.$x(platform.viewers_xpath);
        // add entry to the database
        await client.query(`INSERT INTO entries (streamer, date, viewers) VALUES ($1, $2, $3)`, [streamers[i].name, new Date(), viewers.textContent]);
        console.log(`${streamers[i].name} has ${viewers.textContent} viewers`);
        // close the browser window
        await page.close();
    }
}

const init = async () => {
    // connect to the databas, crendentials are in the .env file
    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });

    // Get all entries in the streamer table and convert them to a json array
    const streamers = await client.query(`SELECT * FROM streamers`);
    const streamers_json = streamers.rows.map(streamer => {
        return {
            name: streamer.name,
            url: streamer.url,
            platform: streamer.platform
        }
    }).filter(streamer => streamer.url !== null);

    // Get all entries in the platforms table and convert them to a json array
    const platforms = await client.query(`SELECT * FROM platforms`);
    const platforms_json = platforms.rows.map(platform => {
        return {
            name: platform.name,
            viewers_xpath: platform.viewers_xpath,
            url: platform.url
        }
    }).filter(platform => platform.url !== null);
    // Scrape streamers
    await scrap(streamers_json, platforms_json, client);
}


// run the script every n seconds specified in the .env file
// default is every 15 minutes
setInterval(init, process.env.SCRAPE_INTERVAL ?? 900000);