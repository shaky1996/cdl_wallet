import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { validityPercent, daysUntil, getStatus } from '../utils/dateHelpers';

export default function ExpiryBar({ uploadedAt, expiryDate }) {
    const status = getStatus(expiryDate);
    const days = daysUntil(expiryDate);
    const pct = uploadedAt
        ? validityPercent(uploadedAt, expiryDate)
        : Math.max(0, Math.min(100, (days / 365) * 100));

    const colorMap = {
        valid: theme.colors.green,
        expiring: theme.colors.amber,
        critical: theme.colors.red,
        expired: theme.colors.red
    };

    const barColor = colorMap[status] || theme.colors.red;

    return (
        <View>
            <View style={styles.track}>
                <View
                    style={[
                        styles.fill,
                        { width: `${pct}%`, backgroundColor: barColor }
                    ]}
                />
            </View>
            <Text style={[styles.daysText, { color: barColor }]}>
                {days > 0 ? `${days} days remaining` : 'Expired'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4
    },
    fill: {
        height: '100%',
        borderRadius: 2
    },
    daysText: {
        fontSize: theme.font.sm,
        textAlign: 'right',
        fontWeight: '500'
    }
});