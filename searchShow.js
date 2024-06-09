const puppeteer = require("puppeteer");
const fs = require("fs");
const http = require("http");
const log = require("./Functions/log");
const sleep = require("./Functions/sleep");
const { exec } = require("node:child_process");

const saveScreenshot = false;
const outputJson = true;

const titlesFileName = "scrap.txt";
const outputFolder = "scrapped/";

const launchCode = true;
const sleepMS = 500;

if (process.argv.length <= 2 && !fs.existsSync(titlesFileName)) {
    console.log("Please provide show name:");

    let fileName = process.argv[1].split("/");
    fileName = fileName[fileName.length - 1];

    console.log(`\t bun ${fileName} 'Breaking bad'`);
    console.log(
        `\t Or make ${titlesFileName} file and put all titles in there to scrap, separated by new line`
    );

    return;
}

(async () => {
    // Create output folder
    if (!fs.existsSync(outputFolder)) {
        log("Created output folder");
        fs.mkdirSync(outputFolder);
    }

    // Launch the browser and open a new blank page
    log("Launching browser");
    const browser = await puppeteer.launch({ headless: true });
    log("Browser has opened, and opening new page");
    const page = await browser.newPage();

    // Either scrap by text file, or scrap by search
    if (fs.existsSync(titlesFileName)) {
        log(`Reading ${titlesFileName}`);
        let titles = fs.readFileSync(titlesFileName).toString();
        titles = titles.split("\n").filter((title) => title !== "");

        for (title of titles) {
            log(`Scrapping for ${title}`);
            await scrap(title, browser, page);
            log(`Sleeping for ${sleepMS} MS`);
            await removeLineFromFile(titlesFileName, title);
            await sleep(sleepMS);
        }

        await browser.close();
        fs.rmSync(titlesFileName);
    } else {
        const searchTitle = process.argv[2];
        log(`Doing search for '${searchTitle}'`);
        await scrap(searchTitle, browser, page);
        await browser.close();

        if (launchCode) {
            exec(`gnome-text-editor "./${outputFolder}${searchTitle}.json"`);
        }
    }
})();

async function scrap(title, browser, page) {
    // Navigate the page to a URL
    const url = "https://www.themoviedb.org/";
    await page.goto(url);
    log(`${url} has loaded!`);

    // Search for the title
    const searchElement = await page.$("#inner_search_v4");
    await searchElement.type(title);
    await searchElement.press("Enter");

    // click first result
    const resultSelector = ".results>.card>.wrapper>.image";
    log("Waiting for the search result");
    await page.waitForSelector(resultSelector);
    await page.click(resultSelector);
    log("Opened first search result");

    log("Search result has opened");
    const boldSelectors = "section.facts>p";
    await page.waitForSelector(boldSelectors);

    const tmdbURL = await page.url();
    const movie = tmdbURL.includes("/tv/") ? false : true;

    // Get posters link
    await page.waitForSelector("img.poster");
    const showImageUrl = await page.evaluate(() => {
        // get image url
        return document.querySelector("img.poster").src;
    });

    // Get shows title with a year
    const showTitle = await page.evaluate(() => {
        return document.querySelector("h2").innerText;
    });

    // Get user score
    const userScore = await page.evaluate(() => {
        return document
            .querySelector(".user_score_chart")
            .getAttribute("data-percent");
    });

    // Find status and return it, and image URL
    const status = await page.evaluate(() => {
        const boldSelectors = "section.facts>p";
        const texts = document.querySelectorAll(boldSelectors);
        let returnVal = "Did not find status";

        for (text of texts) {
            if (text.innerText.includes("Status")) {
                returnVal = text.innerText.replace("Status\n", "");
            }
        }

        return returnVal;
    });

    // Get overview
    const overview = await page.evaluate(() => {
        return document.querySelector(".overview>p").innerText;
    });

    if (!movie) {
        // If this is show, then we are searching for a show too
        // Find the button that says view all seasons and click it
        log("Searching for all seasons button");
        await page.evaluate(() => {
            const buttons = document.querySelectorAll(".new_button>a");
            for (btn of buttons) {
                if (btn.innerText.includes("Seasons")) {
                    btn.click();
                }
            }
        });

        // get seasons and info about it with regex
        await page.waitForSelector(".season_wrapper");
        log("All seasons page has opened");
        const seasons = await page.evaluate(() => {
            let tmp = [];

            const seasons = document.querySelectorAll(
                ".season_wrapper>section>.season>.content>div"
            );
            for (season of seasons) {
                // tmp.push({ textContent: season.textContent });
                let contentText = season.querySelector("h4.flex").textContent;
                tmp.push({
                    title: season.querySelector("a").textContent || "No title",
                    episodes: contentText.match(/\d+.episod\w+/im)
                        ? contentText.match(/\d+.episod\w+/im)[0]
                        : "0 Episodes",
                    year: contentText.match(/\d{4}/im)
                        ? contentText.match(/\d{4}/im)[0]
                        : "No year",
                    overview:
                        season
                            .querySelector("div.season_overview")
                            .innerText.match(/\S+/gim)
                            .join(" ") || "No season overview",
                });
            }

            return tmp;
        });
    }

    const json = {
        title: showTitle,
        overview: overview,
        status: status,
        type: movie ? "Movie" : "Show",
        userScore: userScore || "No idea",
        posterUrl: showImageUrl,
        tmdbURL: tmdbURL,
        seasons: movie ? [] : seasons,
    };

    if (outputJson) {
        log("Outputting json with the show information");
        fs.writeFile(
            `${outputFolder}${title}.json`,
            JSON.stringify(json, null, 4),
            (err) => {
                if (err) {
                    log("Error happened, didnt write the json file");
                } else {
                    log("Successfully wrote json file");
                }
            }
        );
    }

    // Make screenshot if needed
    if (saveScreenshot) {
        log(`Making screenshot and saving to ${outputFolder}${title}.png`);
        await page.screenshot({ path: outputFolder + title + ".png" });
    }

    log(`Status: ${status}`);
}

async function removeLineFromFile(filePath, textToRemove) {
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err;

        const lines = data.split("\n");
        const updatedLines = lines.filter((line) => line !== textToRemove);

        const updatedData = updatedLines.join("\n");
        fs.writeFile(filePath, updatedData, "utf8", (err) => {
            if (err) throw err;
            log("Line removed successfully");
        });
    });
}
