import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { STATUS_CONFIG } from '../constants/statusConfig';

export default function StatusBadge({ status, style }) {
    const cfg = STATUS_CONFIG[status] || CONFIG.expired;

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
            <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
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
