import { classifyCategory, matchKeywords, generateId, normalizeType } from './classifier.js';

const toDate = str => {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
};

const parseBudget = text => {
    if (!text) return null;
    const m = text.match(/[\d,]+/);
    return m ? parseInt(m[0].replace(/,/g, ''), 10) : null;
};

/**
 * Takes a raw scraped object and returns a normalized RFP document
 * ready for MongoDB insertion.
 */
export function normalize(raw) {
    const category = classifyCategory(raw.title || '', raw.description || '');
    const internalId = generateId(category.code);

    return {
        internalId,
        sourceId: raw.sourceId || raw.noticeId || '',
        source: raw.source || 'Unknown',
        sourceUrl: raw.sourceUrl || '',

        type: normalizeType(raw.type),
        category: category.name,
        categoryCode: category.code,
        naicsCode: raw.naicsCode || '',
        naicsDesc: raw.naicsDesc || '',

        title: (raw.title || '').trim(),
        description: (raw.description || '').trim(),
        summary: (raw.description || '').slice(0, 300).trim(),

        agency: raw.agency || raw.fullParentPathName || raw.departmentName || '',
        department: raw.department || '',
        contactName: raw.contactName || '',
        contactEmail: raw.contactEmail || '',
        contactPhone: raw.contactPhone || '',

        country: raw.country || 'USA',
        state: raw.state || '',
        city: raw.city || '',
        zipCode: raw.zipCode || '',

        postedDate: toDate(raw.postedDate),
        deadline: toDate(raw.deadline || raw.responseDeadLine),
        awardDate: toDate(raw.awardDate),
        scrapedAt: new Date(),

        budget: parseBudget(raw.budgetText),
        budgetText: raw.budgetText || '',
        contractTerm: raw.contractTerm || '',

        isActive: (() => {
            const dl = toDate(raw.deadline || raw.responseDeadLine);
            if (!dl) return true; // no deadline = assume active
            return dl > new Date(); // expired only if deadline is explicitly past
        })(),
        isGlobal: false,
        hasBudget: !!(raw.budgetText),
        hasDocument: !!(raw.documentUrl),
        infoOnly: (raw.title || '').toUpperCase().includes('INFO ONLY'),

        matchedKeywords: matchKeywords((raw.title || '') + ' ' + (raw.description || '')),
    };
}
