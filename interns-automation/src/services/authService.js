import fs from "fs";

export const ensureLogin = async (page, payload) => {
    const isLoginPage = await page.$('input[type="password"]');

    if (isLoginPage) {
        await page.type("#login-email", payload.email, { delay: 100 });
        await page.type("#login-password", payload.password, { delay: 120 });

        await page.click("button[type=submit]");
        await page.waitForNavigation();

        const cookies = await page.cookies();
        fs.writeFileSync("cookies.json", JSON.stringify(cookies));
    }
};