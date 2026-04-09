export default () => ({
    browserless: {
        wsEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
    },
    internations: {
        email: process.env.INTERNATIONS_EMAIL,
        password: process.env.INTERNATIONS_PASSWORD,
        groupUrl: process.env.GROUP_URL,
    },
});