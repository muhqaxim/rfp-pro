import { Router } from 'express';
import { RFP } from '../db/rfp.model.js';
import { isConnected } from '../db/mongoose.js';

const router = Router();

// GET /api/rfps — main listing with filters
router.get('/', async (req, res) => {
    if (!isConnected()) {
        return res.status(503).json({ error: 'Database not connected', code: 'DB_NOT_CONNECTED' });
    }

    const {
        q = '',
        state = '',
        type = '',
        categoryCode = '',
        source = '',
        deadlineWithin = '',
        sort = 'scrapedAt',   // default: newest scraped first
        page = '1',
        limit = '25',
    } = req.query;

    const query = {};
    if (q) query.$text = { $search: q };
    if (state) query.state = state.toUpperCase();
    if (type) query.type = type;
    if (categoryCode) query.categoryCode = categoryCode;
    if (source) query.source = source;
    if (deadlineWithin) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + parseInt(deadlineWithin));
        query.deadline = { $lte: cutoff, $gte: new Date() };
    }

    const sortMap = {
        scrapedAt: { scrapedAt: -1 },
        postedDate: { postedDate: -1 },
        deadline: { deadline: 1 },
        relevance: q ? { score: { $meta: 'textScore' } } : { scrapedAt: -1 },
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        const [results, total] = await Promise.all([
            RFP.find(query).sort(sortMap[sort] || sortMap.scrapedAt).skip(skip).limit(parseInt(limit)).lean(),
            RFP.countDocuments(query),
        ]);
        res.json({ results, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('[API /rfps]', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/rfps/stats
router.get('/stats', async (req, res) => {
    if (!isConnected()) return res.status(503).json({ error: 'DB not connected', code: 'DB_NOT_CONNECTED' });
    try {
        const [total, bySource, byCategory, byState] = await Promise.all([
            RFP.countDocuments(),
            RFP.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            RFP.aggregate([{ $group: { _id: { code: '$categoryCode', name: '$category' }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            RFP.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
        ]);
        res.json({ total, bySource, byCategory, byState });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/rfps/:id
router.get('/:id', async (req, res) => {
    if (!isConnected()) return res.status(503).json({ error: 'DB not connected' });
    try {
        const rfp = await RFP.findById(req.params.id).lean();
        rfp ? res.json(rfp) : res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
