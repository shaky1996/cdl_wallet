import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function BackButtonBar({ title, onBack, rightComponent }) {
    return (
        <View style={styles.header}>
            {/* LEFT */}
            <TouchableOpacity
                onPress={onBack}
                style={styles.side}
            >
                <Ionicons
                    name={'chevron-back-outline'}
                    style={styles.backIcon}
                />
                <Text style={styles.backBtn}>Back</Text>
            </TouchableOpacity>

            {/* CENTER */}
            <Text
                style={styles.title}
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    // keeps title perfectly centered
    side: {
        width: 80, // slightly wider to fit icon + text
        flexDirection: 'row',
        alignItems: 'center'
    },

    backBtn: {
        fontSize: 16,
        color: colors.accent,
        fontWeight: '600'
    },
    backIcon: {
        fontSize: 28,
        color: colors.accent,
        fontWeight: '600'
    },

    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary
    }
});
