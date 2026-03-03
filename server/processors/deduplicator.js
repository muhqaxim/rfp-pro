import { RFP } from '../db/rfp.model.js';

/**
 * Saves an array of normalized RFP objects to MongoDB,
 * skipping duplicates via the sourceId+source unique index.
 */
export async function saveRFPs(rfps) {
    let saved = 0, dupes = 0, errors = 0;

    for (const rfp of rfps) {
        try {
            await RFP.create(rfp);
            saved++;
        } catch (err) {
            if (err.code === 11000) {
                dupes++; // duplicate key — already exists
            } else {
                errors++;
                console.error('  [DB] Save error:', err.message, rfp.title?.slice(0, 60));
            }
        }
    }

    return { saved, dupes, errors };
}
