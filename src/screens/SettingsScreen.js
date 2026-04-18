import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Switch,
    Alert,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../styles/theme';
import { common } from '../styles/common';
import { exportAllData } from '../services/exportData';
import { sweepOrphanFiles } from '../services/storage';
import { useAsyncError } from '../hooks/useAsyncError';
import Header from '../components/Header';

const BIOMETRICS_PREF_KEY = 'cdl_biometrics_enabled';

export default function SettingsScreen() {
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);
    const [orphanCount, setOrphanCount] = useState(null);
    const { loading, run } = useAsyncError();

    useEffect(() => {
        loadPrefs();
    }, []);

    const loadPrefs = async () => {
        try {
            const val = await AsyncStorage.getItem(BIOMETRICS_PREF_KEY);
            setBiometricsEnabled(val !== 'false');
        } catch (e) {
            console.warn('Could not load preferences:', e.message);
        }
    };

    const toggleBiometrics = async (value) => {
        setBiometricsEnabled(value);
        try {
            await AsyncStorage.setItem(BIOMETRICS_PREF_KEY, String(value));
        } catch (e) {
            Alert.alert('Error', 'Could not save preference.');
        }
    };

    const handleExport = () => {
        run(exportAllData, {
            errorMessage: 'Export failed. Please try again.'
        });
    };

    const handleOrphanSweep = async () => {
        run(() => sweepOrphanFiles(), {
            onSuccess: (count) => {
                setOrphanCount(count);
                Alert.alert(
                    'Storage cleaned',
                    count > 0
                        ? `Removed ${count} unused file${count > 1 ? 's' : ''}.`
                        : 'No orphan files found. Storage is clean.'
                );
            },
            errorMessage: 'Storage cleanup failed.'
        });
    };

    const handleDeleteAllData = () => {
        Alert.alert(
            'Delete all data',
            'This will permanently delete all your documents, archive, and settings. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert(
                                'Data deleted',
                                'All your data has been removed from this device.'
                            );
                        } catch (e) {
                            Alert.alert(
                                'Error',
                                'Could not delete data. Please try again.'
                            );
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={common.safeArea}>
            <Header subtitle='Settings' />

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Security section */}
                <Text style={styles.sectionLabel}>Security</Text>
                <View style={styles.settingsGroup}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>
                                Face ID / Biometrics
                            </Text>
                            <Text style={styles.settingSub}>
                                Require Face ID to open the app
                            </Text>
                        </View>
                        <Switch
                            value={biometricsEnabled}
                            onValueChange={toggleBiometrics}
                            trackColor={{
                                false: theme.colors.border,
                                true: theme.colors.accent
                            }}
                            thumbColor='#fff'
                        />
                    </View>
                </View>

                {/* Data section */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                    Data
                </Text>
                <View style={styles.settingsGroup}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleExport}
                        disabled={loading}
                    >
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>
                                Export my data
                            </Text>
                            <Text style={styles.settingSub}>
                                Save a backup of all your document metadata
                            </Text>
                        </View>
                        {loading ? (
                            <ActivityIndicator
                                color={theme.colors.accent}
                                size='small'
                            />
                        ) : (
                            <Text style={styles.arrow}>›</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.rowDivider} />

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleOrphanSweep}
                        disabled={loading}
                    >
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>
                                Clean up storage
                            </Text>
                            <Text style={styles.settingSub}>
                                Remove any unused files from device storage
                                {orphanCount !== null
                                    ? ` · Last sweep: ${orphanCount} removed`
                                    : ''}
                            </Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Backup notice */}
                <View style={styles.noticeBanner}>
                    <Text style={styles.noticeTitle}>Keep your backup on</Text>
                    <Text style={styles.noticeText}>
                        Your documents are stored on this device only. Make sure
                        iCloud (iPhone) or Google One (Android) backup is
                        enabled so your data transfers to a new phone
                        automatically.
                    </Text>
                </View>

                {/* About section */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                    About
                </Text>
                <View style={styles.settingsGroup}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingName}>Version</Text>
                        <Text style={styles.settingVal}>1.0.0</Text>
                    </View>
                    <View style={styles.rowDivider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingName}>Storage</Text>
                        <Text style={styles.settingVal}>On-device only</Text>
                    </View>
                    <View style={styles.rowDivider} />
                    <View style={styles.settingRow}>
                        <Text style={styles.settingName}>Encryption</Text>
                        <Text style={styles.settingVal}>AES-256</Text>
                    </View>
                </View>

                {/* Danger zone */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                    Danger zone
                </Text>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={handleDeleteAllData}
                >
                    <Text style={styles.deleteBtnText}>Delete all data</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>
                    CDL Wallet · Your documents never leave your phone
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screenTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.xl,
        fontWeight: '500',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.bg
    },
    body: {
        flex: 1,
        backgroundColor: theme.colors.bgBody
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: 60
    },
    sectionLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.font.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm
    },
    settingsGroup: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.lg,
        borderWidth: 0.5,
        borderColor: theme.colors.border,
        overflow: 'hidden'
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md
    },
    settingInfo: {
        flex: 1,
        marginRight: theme.spacing.md
    },
    settingName: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.base,
        fontWeight: '500'
    },
    settingSub: {
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 2,
        lineHeight: 16
    },
    settingVal: {
        color: theme.colors.textMuted,
        fontSize: theme.font.md
    },
    arrow: {
        color: theme.colors.textMuted,
        fontSize: 20
    },
    rowDivider: {
        height: 0.5,
        backgroundColor: theme.colors.border,
        marginLeft: theme.spacing.md
    },
    noticeBanner: {
        backgroundColor: '#1a2a1e',
        borderRadius: theme.radius.md,
        borderWidth: 0.5,
        borderColor: theme.colors.green + '88',
        padding: theme.spacing.md,
        marginTop: theme.spacing.md
    },
    noticeTitle: {
        color: theme.colors.green,
        fontSize: theme.font.md,
        fontWeight: '600',
        marginBottom: 4
    },
    noticeText: {
        color: theme.colors.green + 'cc',
        fontSize: 12,
        lineHeight: 18
    },
    deleteBtn: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.red + '66',
        padding: theme.spacing.lg,
        alignItems: 'center'
    },
    deleteBtnText: {
        color: theme.colors.red,
        fontSize: theme.font.base,
        fontWeight: '500'
    },
    footer: {
        color: theme.colors.textMuted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 32
    }
});
