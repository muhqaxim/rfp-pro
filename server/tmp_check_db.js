import { connectDB, isConnected } from './db/mongoose.js';
import { RFP } from './db/rfp.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function check() {
    await connectDB();
    const count = await RFP.countDocuments({ matchedKeywords: { $exists: true, $not: { $size: 0 } } });
    console.log(`RFPs with matched keywords: ${count}`);
    const latest = await RFP.find({ matchedKeywords: { $exists: true, $not: { $size: 0 } } }).limit(2).lean();
    console.log(JSON.stringify(latest, null, 2));
    process.exit(0);
}
check();
