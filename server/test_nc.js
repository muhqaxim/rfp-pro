import axios from 'axios';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function test() {
    const kw = 'Financial Aid';
    const url = `https://evp.nc.gov/solicitations/?keyword=${encodeURIComponent(kw)}`;
    console.log(`Testing NC eVP: ${url}`);
    try {
        const res = await axios.get(url, { headers: { 'User-Agent': UA } });
        const $ = cheerio.load(res.data);
        const titles = [];
        $('.view-content .views-row, .solicitation-item, a').each((_, el) => {
            const t = $(el).text().trim();
            if (t.length > 20) titles.push(t);
        });
        console.log(`Found ${titles.length} candidate links`);
        console.log(`First 3:`, titles.slice(0, 3));
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}
test();
