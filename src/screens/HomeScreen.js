import React, { useCallback, useState } from 'react';
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
import { deleteDoc } from '../services/fileSystem';
import DocCard from '../components/DocCard';
import Header from '../components/Header';
import { useLanguage } from '../i18n/LanguageContext';
import {
    ALL_DOC_TYPES,
    BASE_DOC_TYPES,
    PREMIUM_DOC_TYPES,
    isPremiumDocType
} from '../constants/docTypes';
import { usePremium } from '../iap/PremiumContext';
import { Ionicons } from '@expo/vector-icons';


export default function HomeScreen({ navigation }) {
    const [docs, setDocs] = React.useState({});
    const [premiumExpanded, setPremiumExpanded] = useState(false);
    const { t } = useLanguage();
    const { isPremium } = usePremium();

    useFocusEffect(
        useCallback(() => {
            getDocs().then(setDocs);
        }, [])
    );

    

    const handleDelete = async (docType) => {
        const updatedDocs = await deleteDoc(docType);
        setDocs(updatedDocs);
    };

    const handleDocPress = (docType) => {
        if (isPremiumDocType(docType) && !isPremium) {
            navigation.navigate('Premium');
            return;
        }

        docs[docType]
            ? navigation.navigate('DocViewer', { docType })
            : navigation.navigate('Upload', { docType });
    };

    const visibleDocTypes = isPremium ? ALL_DOC_TYPES : BASE_DOC_TYPES;

    const renderDocCard = (docType) => (
        <DocCard
            key={docType}
            docType={docType}
            doc={docs[docType]}
            onPress={() => handleDocPress(docType)}
            onDelete={() => handleDelete(docType)}
        />
    );

    return (
        <SafeAreaView style={styles.safe}>
            <Header subtitle={t('header.home')} />

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.sectionLabel}>{t('home.sectionLabel')}</Text>

                {visibleDocTypes.map(renderDocCard)}

                {!isPremium ? (
                    <View style={styles.premiumGroup}>
                        <TouchableOpacity
                            activeOpacity={0.86}
                            style={styles.premiumGroupHeader}
                            onPress={() =>
                                setPremiumExpanded((current) => !current)
                            }
                        >
                            <View style={styles.premiumIconWrap}>
                                <Ionicons
                                    name='diamond-outline'
                                    size={18}
                                    color={colors.accent}
                                />
                            </View>

                            <View style={styles.premiumHeaderText}>
                                <View style={styles.premiumTitleRow}>
                                    <Text style={styles.premiumTitle}>
                                        {t('premium.documentsTitle')}
                                    </Text>
                                    <View style={styles.premiumBadge}>
                                        <Text style={styles.premiumBadgeText}>
                                            {t('premium.badge')}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.premiumSubtitle}>
                                    {t('premium.documentsSubtitle')}
                                </Text>
                            </View>

                            <Ionicons
                                name={
                                    premiumExpanded
                                        ? 'chevron-up'
                                        : 'chevron-down'
                                }
                                size={18}
                                color={colors.textMuted}
                            />
                        </TouchableOpacity>

                        {premiumExpanded ? (
                            <View style={styles.premiumRows}>
                                {PREMIUM_DOC_TYPES.map((docType, index) => (
                                    <TouchableOpacity
                                        key={docType}
                                        style={[
                                            styles.premiumRow,
                                            index > 0 && styles.premiumRowBorder
                                        ]}
                                        onPress={() =>
                                            navigation.navigate('Premium')
                                        }
                                    >
                                        <View style={styles.premiumRowIcon}>
                                            <Ionicons
                                                name='document-text-outline'
                                                size={16}
                                                color={colors.green}
                                            />
                                        </View>
                                        <Text style={styles.premiumRowTitle}>
                                            {t(`docs.${docType}`)}
                                        </Text>
                                        <View style={styles.premiumRowBadge}>
                                            <Text
                                                style={
                                                    styles.premiumRowBadgeText
                                                }
                                            >
                                                {t('premium.badge')}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name='lock-closed-outline'
                                            size={16}
                                            color={colors.accent}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}
                    </View>
                ) : null}

                <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => navigation.navigate('Share')}
                >
                    <Text style={styles.shareBtnText}>
                        {t('home.shareButton')}
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
    body: { flex: 1, backgroundColor: colors.bgBody },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
        gap: 12
    },
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
    shareBtnText: { color: '#1a1200', fontSize: 15, fontWeight: '600' },
    premiumGroup: {
        backgroundColor: colors.bgCard,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden'
    },
    premiumGroupHeader: {
        minHeight: 88,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    premiumIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2b2416',
        borderWidth: 1,
        borderColor: colors.accent + '55'
    },
    premiumHeaderText: {
        flex: 1
    },
    premiumTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4
    },
    premiumTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700'
    },
    premiumBadge: {
        backgroundColor: '#2b2416',
        borderRadius: 7,
        borderWidth: 1,
        borderColor: colors.accent + '66',
        paddingHorizontal: 7,
        paddingVertical: 2
    },
    premiumBadgeText: {
        color: colors.accent,
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase'
    },
    premiumSubtitle: {
        color: colors.textMuted,
        fontSize: 12,
        lineHeight: 17
    },
    premiumRows: {
        borderTopWidth: 0.5,
        borderTopColor: colors.border
    },
    premiumRow: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 10
    },
    premiumRowBorder: {
        borderTopWidth: 0.5,
        borderTopColor: colors.border
    },
    premiumRowIcon: {
        width: 24,
        height: 24,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgBody
    },
    premiumRowTitle: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: '500'
    },
    premiumRowBadge: {
        borderRadius: 6,
        backgroundColor: '#2b2416',
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    premiumRowBadgeText: {
        color: colors.accent,
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase'
    }
});
