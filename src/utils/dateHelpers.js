export const daysUntil = (expiryDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

export const getStatus = (expiryDateStr) => {
    const days = daysUntil(expiryDateStr);
    if (days < 0) return 'expired';
    if (days <= 10) return 'critical';
    if (days <= 30) return 'expiring';
    return 'valid';
};

export const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const validityPercent = (uploadedAt, expiryDateStr) => {
    const start = new Date(uploadedAt).getTime();
    const end = new Date(expiryDateStr).getTime();
    const now = Date.now();
    const total = end - start;
    const remaining = end - now;
    return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
};
