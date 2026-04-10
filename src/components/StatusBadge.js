import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const CONFIG = {
    valid: {
        label: 'Valid',
        bg: theme.colors.green + '33',
        border: theme.colors.green,
        text: theme.colors.green
    },
    expiring: {
        label: 'Expiring soon',
        bg: theme.colors.amber + '33',
        border: theme.colors.amber,
        text: theme.colors.amber
    },
    critical: {
        label: '10 days left',
        bg: theme.colors.red + '33',
        border: theme.colors.red,
        text: theme.colors.red
    },
    expired: {
        label: 'Expired',
        bg: theme.colors.red + '33',
        border: theme.colors.red,
        text: theme.colors.red
    }
};

export default function StatusBadge({ status, style }) {
    const cfg = CONFIG[status] || CONFIG.expired;

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
