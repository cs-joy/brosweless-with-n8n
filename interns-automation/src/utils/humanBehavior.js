export const humanType = async (page, text) => {
    for (const char of text) {
        await page.keyboard.type(char);
        await new Promise((res) =>
            setTimeout(res, 50 + Math.random() * 120)
        );
    }
};

export const humanScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let total = 0;
            const distance = 100;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                total += distance;

                if (total >= 500 + Math.random() * 500) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
};