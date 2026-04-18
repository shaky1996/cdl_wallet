import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function BackButtonBar({ title, onBack, rightComponent }) {
    return (
        <View style={styles.topBar}>
            {/* LEFT */}
            <TouchableOpacity
                onPress={onBack}
                style={styles.side}
            >
                <Text style={styles.backBtn}>‹ Back</Text>
            </TouchableOpacity>

            {/* CENTER */}
            <Text
                style={styles.screenTitle}
                numberOfLines={1}
            >
                {title}
            </Text>

            {/* RIGHT */}
            <View style={styles.side}>{rightComponent || null}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10
    },
    side: {
        width: 70,
        justifyContent: 'center'
    },
    backBtn: {
        fontSize: 16,
        color: theme.colors.text
    },
    screenTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
        flex: 1
    }
});
