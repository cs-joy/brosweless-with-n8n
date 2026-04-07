// import puppeteer from "puppeteer-core";
// import fs from "fs";
// import { randomDelay } from "../utils/delay.js";

// export const initBrowser = async (wsEndpoint) => {
//     const browser = await puppeteer.connect({
//         browserWSEndpoint: wsEndpoint,
//     });

//     const page = await browser.newPage();

//     // load cookies
//     if (fs.existsSync("cookies.json")) {
//         const cookies = JSON.parse(fs.readFileSync("cookies.json"));
//         await page.setCookie(...cookies);
//     }

//     await page.goto("https://www.internations.org");
//     await randomDelay();

//     return { browser, page };
// };

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import randomUseragent from "random-useragent";
import { randomDelay } from "../utils/delay.js";

puppeteer.use(StealthPlugin());

export const initBrowser = async (wsEndpoint) => {
    const browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
    });

    const page = await browser.newPage();

    // 🧠 Random User Agent
    const userAgent = randomUseragent.getRandom();
    await page.setUserAgent(userAgent);

    // 🧠 Viewport randomization
    await page.setViewport({
        width: 1200 + Math.floor(Math.random() * 200),
        height: 800 + Math.floor(Math.random() * 200),
    });

    // 🧠 Load cookies
    if (fs.existsSync("cookies.json")) {
        const cookies = JSON.parse(fs.readFileSync("cookies.json"));
        await page.setCookie(...cookies);
    }

    await page.goto("https://www.internations.org", {
        waitUntil: "domcontentloaded",
    });

    await randomDelay();

    return { browser, page };
};