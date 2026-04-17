import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { DOC_LABELS } from '../constants/docTypes';
import {
    getStatus,
    daysUntil,
    formatDate,
    validityPercent
} from '../utils/dateHelpers';

const STATUS_CONFIG = {
    valid: { label: 'Valid', color: colors.green, border: colors.green },
    expiring: {
        label: 'Expiring soon',
        color: colors.amber,
        border: colors.amber
    },
    critical: { label: 'Almost Expired', color: colors.red, border: colors.red },
    expired: { label: 'Expired', color: colors.red, border: colors.red }
};

export default function DocCard({ docType, doc, onPress }) {
    if (!doc) {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
            >
                <Text style={styles.docType}>{DOC_LABELS[docType]}</Text>
                <Text style={styles.emptyText}>Tap to upload ›</Text>
            </TouchableOpacity>
        );
    }

    const status = getStatus(doc.expiryDate);
    const cfg = STATUS_CONFIG[status];
    const days = daysUntil(doc.expiryDate);
    const pct = validityPercent(doc.uploadedAt, doc.expiryDate);

    return (
        <TouchableOpacity
            style={[styles.card, { borderColor: cfg.border }]}
            onPress={onPress}
        >
            <View style={styles.row}>
                <View>
                    <Text style={styles.docType}>{DOC_LABELS[docType]}</Text>
                    <Text style={styles.docName}>
                        {doc.label || DOC_LABELS[docType]}
                    </Text>
                </View>
                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: cfg.color + '33',
                            borderColor: cfg.color
                        }
                    ]}
                >
                    <Text style={[styles.badgeText, { color: cfg.color }]}>
                        {cfg.label}
                    </Text>
                </View>
            </View>

            <View style={styles.expiryRow}>
                <Text style={styles.expiryLabel}>Expires</Text>
                <Text style={styles.expiryDate}>
                    {formatDate(doc.expiryDate)}
                </Text>
            </View>

            <View style={styles.progressBg}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${pct}%`, backgroundColor: cfg.color }
                    ]}
                />
            </View>

            <Text style={[styles.daysText, { color: cfg.color }]}>
                {days > 0 ? `${days} days remaining` : 'Expired'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10
    },
    docType: {
        color: colors.textMuted,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 2
    },
    docName: { color: colors.textPrimary, fontSize: 16, fontWeight: '500' },
    emptyText: { color: colors.accent, fontSize: 14, marginTop: 8 },
    badge: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 0.5
    },
    badgeText: { fontSize: 11, fontWeight: '600' },
    expiryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    expiryLabel: { color: colors.textMuted, fontSize: 12 },
    expiryDate: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
    progressBg: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4
    },
    progressFill: { height: '100%', borderRadius: 2 },
    daysText: { fontSize: 11, textAlign: 'right', fontWeight: '500' }
});