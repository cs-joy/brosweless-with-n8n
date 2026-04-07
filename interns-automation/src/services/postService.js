import { randomDelay } from "../utils/delay.js";
import { humanType, humanScroll } from "../utils/humanBehavior.js";





export const createPost = async (page, text) => {
    await page.waitForSelector("textarea");

    await humanScroll(page);

    await page.click("textarea");
    await humanType(page, text);

    for (const char of text) {
        await page.keyboard.type(char);
        await randomDelay(30, 120);
    }

    await page.click("button[type=submit]");

    await randomDelay(5000, 8000);
};