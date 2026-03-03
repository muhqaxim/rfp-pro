import mongoose from 'mongoose';

const RFPSchema = new mongoose.Schema({
    // IDENTITY
    internalId: { type: String, unique: true },
    sourceId: { type: String },
    source: { type: String, required: true },
    sourceUrl: { type: String, default: '' },

    // CLASSIFICATION
    type: { type: String, default: 'RFP' },
    category: { type: String, default: '' },
    categoryCode: { type: String, default: 'EXTRA' },
    naicsCode: { type: String, default: '' },
    naicsDesc: { type: String, default: '' },

    // CONTENT
    title: { type: String, required: true },
    description: { type: String, default: '' },
    summary: { type: String, default: '' },

    // ORGANIZATION
    agency: { type: String, default: '' },
    department: { type: String, default: '' },
    contactName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },

    // LOCATION
    country: { type: String, default: 'USA' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    zipCode: { type: String, default: '' },

    // DATES
    postedDate: { type: Date },
    deadline: { type: Date },
    awardDate: { type: Date },
    scrapedAt: { type: Date, default: Date.now },

    // FINANCIALS
    budget: { type: Number, default: null },
    budgetText: { type: String, default: '' },
    contractTerm: { type: String, default: '' },

    // FLAGS
    isActive: { type: Boolean, default: true },
    isGlobal: { type: Boolean, default: false },
    hasBudget: { type: Boolean, default: false },
    hasDocument: { type: Boolean, default: false },
    infoOnly: { type: Boolean, default: false },

    // KEYWORDS
    matchedKeywords: [String],
}, {
    timestamps: true,
});

// Full-text search index
RFPSchema.index({ title: 'text', description: 'text', agency: 'text' });
// Query indexes
RFPSchema.index({ deadline: 1 });
RFPSchema.index({ postedDate: -1 });
RFPSchema.index({ state: 1 });
RFPSchema.index({ isActive: 1 });
RFPSchema.index({ categoryCode: 1 });
RFPSchema.index({ source: 1 });
// Dedup index
RFPSchema.index({ sourceId: 1, source: 1 }, { unique: true, sparse: true });

export const RFP = mongoose.model('RFP', RFPSchema);
