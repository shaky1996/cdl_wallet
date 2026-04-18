import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { colors } from '../constants/colors';

export default function Header({ subtitle }) {
    return (
        
            <View style={styles.header}>
                <View>
                    <Text style={styles.appName}>CDL Wallet</Text>
                    {subtitle && (
                        <Text style={styles.headerSub}>{subtitle}</Text>
                    )}
                </View>
            </View>
        
    );
}

const styles = StyleSheet.create({
    safe: {
        backgroundColor: theme.colors.background
    },
    header: {
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        appName: { color: colors.accent, fontSize: 24, fontWeight: '600' },
        headerSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
