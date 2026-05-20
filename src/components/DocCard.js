import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import {
    getStatus,
    formatPrettyDate
} from '../utils/dateHelpers';
import ExpiryBar from './ExpiryBar';
import { STATUS_CONFIG } from '../constants/statusConfig';
import { useLanguage } from '../i18n/LanguageContext';
import { daysUntil } from '../utils/dateHelpers';

export default function DocCard({ docType, doc, onPress }) {
    const { locale, t } = useLanguage();
    const docLabel = t(`docs.${docType}`);

    if (!doc) {
        return (
            <TouchableOpacity style={styles.card} onPress={onPress}>
                <Text style={styles.docType}>{docLabel}</Text>
                <Text style={styles.emptyText}>{t('home.tapToUpload')}</Text>
            </TouchableOpacity>
        );
    }

    const status = getStatus(doc.expiryDate);
    const cfg = STATUS_CONFIG[status];
    const days = daysUntil(doc.expiryDate);

    return (
        <TouchableOpacity
            style={[styles.card, { borderColor: cfg.border }]}
            onPress={onPress}
        >
            {/* HEADER */}
            <View style={styles.row}>
                <View>
                    <Text style={styles.docType}>{docLabel}</Text>
                    <Text style={styles.docName}>
                        {docLabel}
                    </Text>
                </View>

                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: cfg.bg,
                            borderColor: cfg.border
                        }
                    ]}
                >
                    <Text style={[styles.badgeText, { color: cfg.text }]}>
                        {t(`status.${status}`)}
                    </Text>
                </View>
            </View>

            {/* EXPIRY DATE */}
            <View style={styles.expiryRow}>
                <Text style={styles.expiryLabel}>{t('home.expires')}</Text>
                <Text style={styles.expiryDate}>
                    {formatPrettyDate(doc.expiryDate, locale)}
                </Text>
            </View>

            {/* PROGRESS BAR */}
            <View style={{ width: '100%' }}>
                <ExpiryBar
                    uploadedAt={doc.uploadedAt}
                    expiryDate={doc.expiryDate}
                />
            </View>
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

    docName: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '500'
    },

    emptyText: {
        color: colors.accent,
        fontSize: 14,
        marginTop: 8
    },

    badge: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 0.5
    },

    badgeText: {
        fontSize: 11,
        fontWeight: '600'
    },

    expiryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },

    expiryLabel: {
        color: colors.textMuted,
        fontSize: 12
    },

    expiryDate: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: '500'
    },

    daysText: {
        fontSize: 11,
        textAlign: 'right',
        fontWeight: '500',
        marginTop: 4
    }
});
