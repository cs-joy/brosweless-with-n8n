import { randomDelay } from "../utils/delay.js";

export const commentOnPost = async (page, text) => {
    const posts = await page.$$(".post");

    if (!posts.length) return;

    await posts[0].click();
    await randomDelay();

    await page.type(".comment-box", text, { delay: 80 });
    await page.click(".submit-comment");

    await randomDelay();
};