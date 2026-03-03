// In-memory scrape state — shared across the process
export const scrapeState = {
    running: false,
    progress: [],      // array of { source, status, count }
    startedAt: null,
    finishedAt: null,
    totalSaved: 0,
    totalFetched: 0,
};

export function resetState() {
    scrapeState.running = true;
    scrapeState.progress = [];
    scrapeState.startedAt = new Date().toISOString();
    scrapeState.finishedAt = null;
    scrapeState.totalSaved = 0;
    scrapeState.totalFetched = 0;
}

export function updateProgress(source, status, count = 0, saved = 0) {
    const existing = scrapeState.progress.find(p => p.source === source);
    if (existing) {
        existing.status = status;
        existing.count = count;
        existing.saved = saved;
    } else {
        scrapeState.progress.push({ source, status, count, saved });
    }
    scrapeState.totalFetched += count;
    scrapeState.totalSaved += saved;
}

export function finishState() {
    scrapeState.running = false;
    scrapeState.finishedAt = new Date().toISOString();
}
