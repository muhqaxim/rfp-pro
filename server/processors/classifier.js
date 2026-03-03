// Category codes — matches RFPMart taxonomy
const CATEGORIES = [
    {
        code: 'CC',
        name: 'Call Center / Answering',
        terms: [
            'call center', 'answering service', '24/7', 'hotline', 'contact center',
            'enrollment + retention call center', 'one-stop student services', 'centralized student support'
        ]
    },
    {
        code: 'ITES',
        name: 'IT Services',
        terms: [
            'it support', 'managed services', 'help desk', 'tier 1', 'information technology',
            'desktop support', 'technical support', 'technology solutions', 'it support',
            'professional services – it', 'help desk support'
        ]
    },
    {
        code: 'EDU',
        name: 'Student Services',
        terms: [
            'student', 'financial aid', 'enrollment', 'registrar', 'bursar', 'tuition',
            'retention', 'advising', 'financial aid processing', 'student lifecycle',
            'student experience enhancement', 'retention initiative support',
            'enrollment management services', 'student success initiatives',
            'student lifecycle services', 'shared student services center',
            'one-stop student services rfp', 'centralized student support model'
        ]
    },
    {
        code: 'AI',
        name: 'AI / Automation',
        terms: [
            'ai automation', 'ai chatbot', 'artificial intelligence', 'machine learning',
            'automation', 'chatbot'
        ]
    },
    {
        code: 'SW',
        name: 'Software / SaaS',
        terms: [
            'software', 'platform', 'saas', 'crm', 'erp', 'application', 'system', 'portal'
        ]
    },
    {
        code: 'MRB',
        name: 'Consulting / Advisory',
        terms: [
            'consulting', 'advisory', 'strategic', 'operational efficiency', 'shared services',
            'management consulting', 'operational transformation', 'enrollment management consulting'
        ]
    },
    {
        code: 'BANKING',
        name: 'Finance / Billing / Revenue',
        terms: [
            'billing', 'revenue cycle', 'payment', 'financial', 'collections',
            'accounts receivable', 'tuition billing', 'revenue cycle support',
            'student accounts / bursar', 'student financial services',
            'financial aid support', 'financial aid processing', 'default prevention'
        ]
    },
    {
        code: 'STAFF',
        name: 'Staffing Services',
        terms: [
            'staffing', 'temporary staff', 'workforce', 'recruitment', 'managed services'
        ]
    },
    {
        code: 'EXTRA',
        name: 'Other',
        terms: []
    },
];

// All tracked keywords (matchable against title + description)
export const KEYWORDS = [
    'Financial Aid', 'Billing', 'Registrar Support', 'Call Center',
    'AI Automation', 'Student Experience Enhancement', 'Retention Initiative Support',
    'Enrollment Management Services', 'Shared Services Model', 'Operational Efficiency',
    'Managed Services', 'Professional Services – IT', 'Student Services',
    'Customer Experience', 'Technology Solutions', 'Information Technology',
    '24/7 Support', 'Answering Service', 'Tier 1 Support', 'IT Support',
    'AI Chatbot', 'Financial Aid Support', 'Student Accounts / Bursar',
    'Tuition Billing', 'Revenue Cycle Support', 'Enrollment + Retention Call Center',
    'Back-Office Processing Support', 'Student Financial Services',
    'Enrollment Management', 'Help Desk Support', 'Financial Aid Processing',
    'Default Prevention', 'Student Success Initiatives', 'Enrollment Management Consulting',
    'Retention Services', 'Operational Transformation', 'Student Lifecycle Services',
    'Shared Student Services Center', 'One-Stop Student Services RFP',
    'Centralized Student Support Model'
];

// Internal counters for ID generation
const counters = {};

export function classifyCategory(title = '', desc = '') {
    const text = (title + ' ' + desc).toLowerCase();
    return CATEGORIES.find(c => c.terms.some(t => text.includes(t))) || CATEGORIES[CATEGORIES.length - 1];
}

export function matchKeywords(text = '') {
    const lower = text.toLowerCase();
    return KEYWORDS.filter(k => lower.includes(k.toLowerCase())).slice(0, 10);
}

export function generateId(code) {
    if (!counters[code]) {
        counters[code] = Math.floor(Math.random() * 5000) + 1000;
    }
    counters[code]++;
    return `${code}-${String(counters[code])}-USA`;
}

export function normalizeType(t) {
    const s = (t || '').toUpperCase();
    if (s.includes('RFQ')) return 'RFQ';
    if (s.includes('RFI')) return 'RFI';
    if (s.includes('IFB')) return 'IFB';
    if (s.includes('SOURCES')) return 'Sources Sought';
    if (s.includes('PRESOLICIT')) return 'Pre-Solicitation';
    return 'RFP';
}
