import puppeteer from 'puppeteer';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export async function scrapeWithPuppeteer(url, selector, transformFn) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });
        const page = await browser.newPage();
        await page.setUserAgent(UA);
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`      [Puppeteer] Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

        // Wait for the selector to appear
        await page.waitForSelector(selector, { timeout: 15000 }).catch(() => { });

        // Get the page content
        const html = await page.content();
        await browser.close();
        return html;
    } catch (e) {
        if (browser) await browser.close();
        throw e;
    }
}
