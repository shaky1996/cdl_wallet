export const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;

    // CASE 1: ISO string → take ONLY date part (NO JS parsing)
    if (dateStr.includes('T')) {
        const [datePart] = dateStr.split('T'); // "2026-04-25"
        const [year, month, day] = datePart.split('-');

        return new Date(year, month - 1, day);
    }

    // CASE 2: YYYY-MM-DD (safe)
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day);
};

// 🔥 NEW: Pretty display format (April 20, 2026)
export const formatPrettyDate = (dateStr) => {
    if (!dateStr) return '';

    let date;

    // CASE 1: already YYYY-MM-DD
    if (
        typeof dateStr === 'string' &&
        dateStr.includes('-') &&
        !dateStr.includes('T')
    ) {
        const [year, month, day] = dateStr.split('-');
        date = new Date(year, month - 1, day);
    }
    // CASE 2: ISO string (old data)
    else {
        date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Optional: keep old format if needed anywhere
export const formatShortDate = (dateStr) => {
    const d = parseLocalDate(dateStr);

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const formatMMDDYYYY = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    

    return `${month}-${day}-${year}`;
};

export const daysUntil = (expiryDateStr) => {
    const today = new Date();
    const expiry = parseLocalDate(expiryDateStr);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diff = expiry.getTime() - today.getTime();

    return Math.round(diff / (1000 * 60 * 60 * 24));
};

export const getStatus = (expiryDateStr) => {
    const days = daysUntil(expiryDateStr);

    if (days < 0) return 'expired';
    if (days <= 10) return 'critical';
    if (days <= 30) return 'expiring';
    return 'valid';
};

export const validityPercent = (uploadedAt, expiryDateStr) => {
    const start = parseLocalDate(uploadedAt).getTime();
    const end = parseLocalDate(expiryDateStr).getTime();
    const now = Date.now();

    const total = end - start;
    const remaining = end - now;

    return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
};
