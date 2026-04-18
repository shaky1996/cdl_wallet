import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as MailComposer from 'expo-mail-composer';
import { colors } from '../constants/colors';
import { getDocs } from '../services/storage';
import { imageToPdf } from '../services/pdfExport';
import { DOC_LABELS } from '../constants/docTypes';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Header from '../components/Header';

export default function ShareScreen() {
    const [docs, setDocs] = useState({});
    const [selected, setSelected] = useState({ cdl: false, med_card: false });
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getDocs().then(setDocs);
        }, [])
    );

    const toggle = (type) => setSelected((s) => ({ ...s, [type]: !s[type] }));

    const handleSend = async () => {
        if (!email.trim()) return Alert.alert('Enter employer email');

        const chosenTypes = Object.keys(selected).filter(
            (t) => selected[t] && docs[t]
        );
        if (!chosenTypes.length)
            return Alert.alert('Select at least one document');

        setSending(true);
        try {
            const attachments = await Promise.all(
                chosenTypes.map((t) =>
                    imageToPdf(docs[t].localUri, DOC_LABELS[t])
                )
            );

            await MailComposer.composeAsync({
                recipients: [email.trim()],
                subject: 'CDL Wallet - Driver Documents',
                body: 'Hello, \nPlease find my documents attached.',
                attachments
            });
        } catch (e) {
            Alert.alert('Error', 'Could not open mail composer.');
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <Header subtitle='Share documents' />
            <View style={styles.body}>
                <Text style={styles.label}>Select documents</Text>
                {['cdl', 'med_card'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.docRow,
                            selected[type] && styles.docRowSelected
                        ]}
                        onPress={() => toggle(type)}
                    >
                        <View
                            style={[
                                styles.check,
                                selected[type] && styles.checkOn
                            ]}
                        >
                            {selected[type] && (
                                <Text style={styles.checkMark}>✓</Text>
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docName}>
                                {DOC_LABELS[type]}
                            </Text>
                            {docs[type] && (
                                <Text style={styles.docSub}>
                                    Expires {docs[type].expiryDate}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.pdfBadge}>PDF</Text>
                    </TouchableOpacity>
                ))}

                <Text style={[styles.label, { marginTop: 16 }]}>
                    Employer email
                </Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='dispatch@company.com'
                    placeholderTextColor={colors.textMuted}
                    keyboardType='email-address'
                    autoCapitalize='none'
                />

                <Text style={styles.infoText}>
                    Images are converted to PDF before sending. Files never
                    leave your phone — email is sent from your own mail app.
                </Text>

                <TouchableOpacity
                    style={[styles.sendBtn, sending && { opacity: 0.5 }]}
                    onPress={handleSend}
                    disabled={sending}
                >
                    <Text style={styles.sendBtnText}>
                        {sending ? 'Preparing...' : 'Send documents ›'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    title: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: '500',
        padding: 20
    },
    body: { flex: 1, backgroundColor: colors.bgBody, padding: 16, gap: 8 },
    label: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4
    },
    docRow: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border
    },
    docRowSelected: { borderColor: colors.accent },
    check: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
    checkMark: { color: '#1a1200', fontSize: 13, fontWeight: '700' },
    docName: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
    docSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    pdfBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: '#5DCAA5',
        backgroundColor: '#1a2a1e',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
        overflow: 'hidden'
    },
    input: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        color: colors.textPrimary,
        fontSize: 14
    },
    infoText: {
        color: colors.blue,
        fontSize: 12,
        lineHeight: 18,
        backgroundColor: '#1a1f2e',
        borderRadius: 10,
        padding: 12,
        marginTop: 8
    },
    sendBtn: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8
    },
    sendBtnText: { color: '#1a1200', fontSize: 15, fontWeight: '600' }
});
