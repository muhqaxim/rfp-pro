import { connectDB } from './db/mongoose.js';
import { RFP } from './db/rfp.model.js';
import { normalize } from './processors/normalizer.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const SEED_DATA = [
    {
        source: 'Texas A&M University',
        sourceId: 'TAMU-RFP-26-4947',
        title: 'Student Retention Strategy',
        description: 'Texas A&M University is seeking proposals for a comprehensive student retention strategy to enhance student success and institutional efficiency.',
        agency: 'Texas A&M University',
        state: 'TX',
        deadline: '2026-03-27T14:00:00Z',
        sourceUrl: 'https://bids.sciquest.com/apps/Router/PublicEvent?CustomerOrg=TAMU',
        type: 'RFP'
    },
    {
        source: 'Florida State University',
        sourceId: 'ITN 6790-6',
        title: 'Collection Services for State University System Delinquent Student Accounts',
        description: 'Provision of collection services for delinquent student accounts across the State University System of Florida.',
        agency: 'Florida State University',
        state: 'FL',
        deadline: '2026-04-07T15:00:00Z',
        sourceUrl: 'https://bids.sciquest.com/apps/Router/PublicEvent?CustomerOrg=FSU',
        type: 'ITN'
    },
    {
        source: 'Texas A&M University',
        sourceId: 'TAMU-RFP-26-4968',
        title: 'Online Graduate Program Portfolio Assessment and Five-Year Enrollment Growth Strategy',
        description: 'Seeking a partner for strategic assessment of online graduate programs and enrollment growth planning.',
        agency: 'Texas A&M University',
        state: 'TX',
        deadline: '2026-03-20T14:00:00Z',
        sourceUrl: 'https://bids.sciquest.com/apps/Router/PublicEvent?CustomerOrg=TAMU',
        type: 'RFP'
    },
    {
        source: 'Florida State University',
        sourceId: 'ITN 6791-6',
        title: 'Comprehensive Digital Media Accessibility, Captioning and Transcription Services',
        description: 'Services for digital media accessibility including captioning and transcription for academic support.',
        agency: 'Florida State University',
        state: 'FL',
        deadline: '2026-04-07T15:00:00Z',
        sourceUrl: 'https://bids.sciquest.com/apps/Router/PublicEvent?CustomerOrg=FSU',
        type: 'ITN'
    },
    {
        source: 'University of Florida',
        sourceId: 'FY26-ITN-021',
        title: 'University of Florida Commencement Photography Services',
        description: 'Professional photography services for university commencement ceremonies.',
        agency: 'University of Florida',
        state: 'FL',
        deadline: '2026-04-07T15:00:00Z',
        sourceUrl: 'https://bids.sciquest.com/apps/Router/PublicEvent?CustomerOrg=Florida',
        type: 'ITN'
    }
];

async function seed() {
    await connectDB();
    console.log('Seeding high-value records...');
    for (const raw of SEED_DATA) {
        const normalized = normalize(raw);
        // Ensure matched keywords are present for filtering
        await RFP.findOneAndUpdate(
            { sourceId: normalized.sourceId },
            normalized,
            { upsert: true, new: true }
        );
        console.log(`✅ Seeded: ${normalized.title}`);
    }
    process.exit(0);
}
seed();
