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
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import Header from '../components/Header';
import { formatPrettyDate } from '../utils/dateHelpers';
import { theme } from '../styles/theme';
import InfoBanner from '../components/InfoBanner';
import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function ShareScreen() {
    const { locale, t } = useLanguage();
    const [docs, setDocs] = useState({});
    const [selected, setSelected] = useState({
        cdl: false,
        med_card: false
    });

    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const route = useRoute();

    const isValidEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    };

   
    useEffect(() => {
        if (route.params?.preselect) {
            setSelected((prev) => ({
                ...prev,
                ...route.params.preselect
            }));
        }
    }, [route.params]);

    useFocusEffect(
        useCallback(() => {
            getDocs().then(setDocs);

            return () => {
                // RESET WHEN SCREEN LOSES FOCUS
                setSelected({
                    cdl: false,
                    med_card: false
                });
                setEmail('');
            };
        }, [])
    );

    const toggle = (type) => setSelected((s) => ({ ...s, [type]: !s[type] }));

    const handleSend = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            return Alert.alert(t('shareScreen.enterEmail'));
        }
    
        if (!isValidEmail(trimmedEmail)) {
            return Alert.alert(
                t('shareScreen.invalidEmailTitle'),
                t('shareScreen.invalidEmailMessage')
            );
        };

    const chosenTypes = Object.keys(selected).filter(
        (t) => selected[t] && docs[t]
    );

    if (!chosenTypes.length) {
        return Alert.alert(t('shareScreen.selectOne'));
    }

    setSending(true);



    
    try {
        // 1. Build only selected docs
        const selectedDocs = {};
        chosenTypes.forEach((t) => {
            selectedDocs[t] = docs[t];
        });

        // 2. Generate PDF (returns file:// from expo-print)
        const pdfUri = await imageToPdf(selectedDocs, {
            cdl: t('docs.cdl'),
            med_card: t('docs.med_card')
        });

        // 3. Move to safe cache location (IMPORTANT for MailComposer)
        const safeUri = FileSystem.cacheDirectory + `driver_docs_${Date.now()}.pdf`;

        await FileSystem.copyAsync({
            from: pdfUri,
            to: safeUri
        });

        // 4. Send email with valid file path
        const result = await MailComposer.composeAsync({
            recipients: [email.trim()],
            subject: t('shareScreen.emailSubject'),
            body: t('shareScreen.emailBody'),
            attachments: [safeUri]
        });

        console.log('Mail result:', result);

    } catch (e) {
        console.log('EMAIL ERROR:', e);
        Alert.alert(t('common.error'), t('shareScreen.mailError'));
    } finally {
        setSending(false);
    }
};

    // ✅ NEW: universal share handler
    const handleShare = async () => {
    const chosenTypes = Object.keys(selected).filter(
        (t) => selected[t] && docs[t]
    );

    if (!chosenTypes.length)
        return Alert.alert(t('shareScreen.selectOne'));

    try {
        // build a docs object only with selected ones
        const selectedDocs = {};
        chosenTypes.forEach((t) => {
            selectedDocs[t] = docs[t];
        });

        const pdfUri = await imageToPdf(selectedDocs, {
            cdl: t('docs.cdl'),
            med_card: t('docs.med_card')
        });

        await Sharing.shareAsync(pdfUri);
    } catch (e) {
        Alert.alert(t('common.error'), t('shareScreen.shareError'));
    }
};

    return (
        <SafeAreaView style={styles.safe}>
            <Header subtitle={t('header.share')} />
            <View style={styles.body}>
                <Text style={styles.label}>{t('shareScreen.selectDocuments')}</Text>
                {['cdl', 'med_card'].map((type) => {
                    const isAvailable = !!docs[type];

                    return (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.docRow,
                                selected[type] && styles.docRowSelected,
                                !isAvailable && styles.docRowDisabled
                            ]}
                            onPress={() => isAvailable && toggle(type)}
                            disabled={!isAvailable}
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
                                    {t(`docs.${type}`)}
                                </Text>
                                <Text style={styles.docSub}>
                                    {docs[type]
                                        ? t('shareScreen.expiresOn', {
                                              date: formatPrettyDate(
                                                  docs[type].expiryDate,
                                                  locale
                                              )
                                          })
                                        : t('docs.notUploaded')}
                                </Text>
                            </View>
                            <Text style={styles.pdfBadge}>PDF</Text>
                        </TouchableOpacity>
                    );
                })}

                <Text style={[styles.label, { marginTop: 16 }]}>
                    {t('shareScreen.employerEmail')}
                </Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='dispatch@company.com'
                    placeholderTextColor={colors.textMuted}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    returnKeyType='done'
                />

                <InfoBanner
                    text={
                        t('shareScreen.info')
                    }
                    color={colors.blue}
                    backgroundColor={'#1a1f2e'}
                />

                {/* EMAIL BUTTON */}
                <TouchableOpacity
                    style={[styles.sendBtn, sending && { opacity: 0.5 }]}
                    onPress={handleSend}
                    disabled={sending}
                >
                    <Text style={styles.sendBtnText}>
                        {sending
                            ? t('shareScreen.preparing')
                            : t('shareScreen.emailDocuments')}
                    </Text>
                </TouchableOpacity>

                {/* SHARE BUTTON */}
                <TouchableOpacity
                    style={[styles.sendBtn]}
                    onPress={handleShare}
                >
                    <Text style={styles.sendBtnText}>
                        {t('shareScreen.shareDocuments')}
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
    docRowDisabled: {
        opacity: 0.4
    },
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

    sendBtn: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8
    },
    sendBtnText: { color: '#1a1200', fontSize: 15, fontWeight: '600' },

    shareBtn: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 4,
        borderWidth: 1,
        borderColor: colors.border
    },
    shareBtnText: {
        color: colors.accent,
        fontSize: 15,
        fontWeight: '600'
    }
});
