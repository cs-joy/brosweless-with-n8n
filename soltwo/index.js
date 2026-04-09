require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// ================== CONFIG ==================
const BROWSERLESS_WS = `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`;
const LOGIN_URL = 'https://www.internations.org/login';
const GROUP_URL = process.env.GROUP_URL;

const CREDENTIALS = {
    email: process.env.INTERNATIONS_EMAIL,
    password: process.env.INTERNATIONS_PASSWORD,
};

// ================== HELPERS ==================
async function saveScreenshot(page, name) {
    await page.screenshot({ path: `debug/${name}.png`, fullPage: true });
    console.log(`📸 Screenshot saved: debug/${name}.png`);
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ================== MAIN FUNCTIONS ==================
async function login(page) {
    console.log('🔑 Logging into Internations...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

    // Fill email and password (selectors may need tiny update - inspect the page if it fails)
    await page.type('input[type="email"], input[placeholder*="Email"], input[name*="email"]', CREDENTIALS.email, { delay: 30 });
    await page.type('input[type="password"], input[placeholder*="Password"], input[name*="password"]', CREDENTIALS.password, { delay: 30 });

    // Click login button
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"], button:contains("Log in"), button:contains("Sign in")'),
    ]);

    // Verify successful login
    const url = page.url();
    if (url.includes('login') || url.includes('error')) {
        throw new Error('Login failed - check credentials or selectors');
    }
    console.log('✅ Successfully logged in!');
    await saveScreenshot(page, 'after-login');
}

async function navigateToGroup(page) {
    console.log(`🚀 Navigating to group: ${GROUP_URL}`);
    await page.goto(GROUP_URL, { waitUntil: 'networkidle2' });
    await saveScreenshot(page, 'group-page');
}

async function createPost(page, postData) {
    console.log('📝 Creating new post...');

    // Example: Forum thread (most common)
    // Click "Create thread" button
    await page.waitForSelector('button:contains("Create thread"), a:contains("Create thread"), button:has-text("Create thread")', { timeout: 10000 });
    await page.click('button:contains("Create thread"), a:contains("Create thread"), button:has-text("Create thread")');

    await delay(2000);

    // Fill subject and content (update selectors if needed)
    await page.type('input[placeholder*="Subject"], input[name*="subject"]', postData.subject, { delay: 30 });
    await page.type('textarea, div[role="textbox"], .ql-editor', postData.body, { delay: 30 });

    // Click Post/Submit
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button:contains("Post"), button:contains("Create"), button[type="submit"]'),
    ]);

    console.log('✅ Post created successfully!');
    await saveScreenshot(page, 'post-created');
}

async function commentOnPost(page, postUrl, commentText) {
    console.log(`💬 Commenting on post: ${postUrl}`);
    await page.goto(postUrl, { waitUntil: 'networkidle2' });

    await page.type('textarea, div[role="textbox"]', commentText, { delay: 30 });
    await page.click('button:contains("Comment"), button:contains("Post comment"), button[type="submit"]');

    await delay(3000);
    console.log('✅ Comment posted');
    await saveScreenshot(page, 'comment-posted');
}

async function replyToComment(page, commentSelector, replyText) {
    console.log('↩️ Replying to comment...');
    await page.click(commentSelector); // e.g. reply button under a comment
    await delay(1000);

    await page.type('textarea', replyText, { delay: 30 });
    await page.click('button:contains("Reply"), button:contains("Post")');

    console.log('✅ Reply posted');
}

// ================== MAIN EXECUTION ==================
(async () => {
    console.log('🌐 Connecting to Browserless...');

    const browser = await puppeteer.connect({
        browserWSEndpoint: BROWSERLESS_WS,
        defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();

    // Optional: add stealth (Browserless supports it via query param)
    // You can add &stealth=true to BROWSERLESS_WS if needed

    try {
        await fs.mkdir('debug', { recursive: true });

        await login(page);
        await navigateToGroup(page);

        // === EXAMPLE USAGE ===
        // 1. Create a new forum thread
        await createPost(page, {
            subject: 'Hello everyone from automation! 👋',
            body: 'This post was created automatically using Node.js + Browserless. Let me know if anyone wants to meet for coffee this weekend!',
        });

        // 2. Comment on the latest post (you can make this dynamic by scraping post URLs)
        // await commentOnPost(page, 'https://www.internations.org/.../post-id', 'Great idea! Count me in!');

        // 3. Reply to a comment (example selector - adjust after inspection)
        // await replyToComment(page, 'div.comment-item button.reply-button', 'Totally agree!');

        console.log('🎉 All automation tasks completed successfully!');

    } catch (error) {
        console.error('❌ Automation failed:', error.message);
        await saveScreenshot(page, 'error-screenshot');
    } finally {
        await browser.close();
    }
})();