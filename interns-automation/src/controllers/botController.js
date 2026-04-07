import { initBrowser } from "../services/browserService.js";
import { ensureLogin } from "../services/authService.js";
import { createPost } from "../services/postService.js";
import { commentOnPost } from "../services/commentService.js";
import dotenv from "dotenv";

dotenv.config();

export const runBot = async (req, res) => {
    const { action, payload } = req.body;

    try {
        const { browser, page } = await initBrowser(process.env.BROWSER_WS);

        await ensureLogin(page, payload);

        await page.goto(payload.groupUrl);

        if (action === "post") {
            await createPost(page, payload.text);
        }

        if (action === "comment") {
            await commentOnPost(page, payload.text);
        }

        await browser.close();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};