import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { getDocs } from '../services/storage';
import { getStatus, daysUntil, formatDate } from '../utils/dateHelpers';
import DocCard from '../components/DocCard';

export default function HomeScreen({ navigation }) {
    const [docs, setDocs] = React.useState({});

    useFocusEffect(
        useCallback(() => {
            getDocs().then(setDocs);
        }, [])
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.appName}>CDL Wallet</Text>
                    <Text style={styles.headerSub}>Stay road-ready</Text>
                </View>
            </View>

            <ScrollView
                style={styles.body}
                contentContainerStyle={{ gap: 12 }}
            >
                <Text style={styles.sectionLabel}>Your documents</Text>

                <DocCard
                    docType='cdl'
                    doc={docs.cdl}
                    onPress={() =>
                        docs.cdl
                            ? navigation.navigate('DocViewer', {
                                  docType: 'cdl'
                              })
                            : navigation.navigate('Upload', { docType: 'cdl' })
                    }
                />

                <DocCard
                    docType='med_card'
                    doc={docs.med_card}
                    onPress={() =>
                        docs.med_card
                            ? navigation.navigate('DocViewer', {
                                  docType: 'med_card'
                              })
                            : navigation.navigate('Upload', {
                                  docType: 'med_card'
                              })
                    }
                />

                <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => navigation.navigate('Share')}
                >
                    <Text style={styles.shareBtnText}>
                        Share with employer ›
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
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
    body: { flex: 1, backgroundColor: colors.bgBody, padding: 16 },
    sectionLabel: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4
    },
    shareBtn: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 4
    },
    shareBtnText: { color: '#1a1200', fontSize: 15, fontWeight: '600' }
});
