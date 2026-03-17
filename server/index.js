import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __envDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__envDir, '.env') });

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { connectDB, isConnected } from './db/mongoose.js';
import rfpsRouter from './routes/rfps.js';
import { runAllScrapers, SCRAPERS } from './scrapers/runner.js';
import { scrapeState, resetState, finishState } from './scrapers/scrapeState.js';
import { RFP } from './db/rfp.model.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'], methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());

// ── Routes ───────────────────────────────────
app.use('/api/rfps', rfpsRouter);

// Health + DB status
app.get('/api/health', (req, res) => res.json({ status: 'ok', dbConnected: isConnected() }));

// Scrape status — polled by frontend for live progress
app.get('/api/scrape/status', (req, res) => res.json(scrapeState));

// Trigger scrape
app.post('/api/scrape', (req, res) => {
    if (!isConnected()) return res.status(503).json({ error: 'DB not connected' });

    // Allow force reset if scrape is stuck
    if (req.query.force === 'true') {
        console.log('🔄 Force resetting scrape state');
        resetState();
    } else if (scrapeState.running) {
        return res.json({ message: 'Scrape already in progress', running: true });
    }

    console.log('\n🔁 Scrape triggered');
    res.json({ message: 'Scrape started', running: true });
    runAllScrapers().catch(e => {
        console.error('Scrape error:', e);
        finishState();
    });
});

// Sources list — what scrapers are configured
app.get('/api/sources', (req, res) => {
    res.json(SCRAPERS.map(s => ({
        name: s.name,
        url: s.url || s.baseUrl || '',
        state: s.state || 'US',
    })));
});

// Patch all existing isActive=false with no deadline to true (one-time fix)
app.post('/api/admin/fix-active', async (req, res) => {
    if (!isConnected()) return res.status(503).json({ error: 'DB not connected' });
    const result = await RFP.updateMany({ isActive: false, deadline: null }, { $set: { isActive: true } });
    res.json({ updated: result.modifiedCount });
});

// ── Start ────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`\n🚀 ITOD Scraper  |  http://localhost:${PORT}`);
    console.log(`   DB: ${(process.env.MONGODB_URI || '').replace(/:\/\/[^@]+@/, '://***@') || '❌ not set'}\n`);
    await connectDB();

    // Auto-fix existing data on startup
    if (isConnected()) {
        try {
            const r = await RFP.updateMany({ isActive: false, deadline: null }, { $set: { isActive: true } });
            if (r.modifiedCount > 0) console.log(`🔧 Fixed ${r.modifiedCount} inactive records`);
        } catch { }
    }
});

// Daily scrape at 2am
cron.schedule('0 2 * * *', () => {
    if (!isConnected()) return;
    runAllScrapers().catch(e => console.error('Cron error:', e.message));
});
