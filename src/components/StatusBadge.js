import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { STATUS_CONFIG } from '../constants/statusConfig';
import { useLanguage } from '../i18n/LanguageContext';

export default function StatusBadge({ status, style }) {
    const { t } = useLanguage();
    const resolvedStatus = STATUS_CONFIG[status] ? status : 'expired';
    const cfg = STATUS_CONFIG[resolvedStatus];

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: cfg.bg,
                    borderColor: cfg.border
                },
                style
            ]}
        >
            <Text style={[styles.text, { color: cfg.text }]}>
                {t(`status.${resolvedStatus}`)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 0.5,
        alignSelf: 'flex-start'
    },
    text: {
        fontSize: theme.font.sm,
        fontWeight: '600'
    }
});
