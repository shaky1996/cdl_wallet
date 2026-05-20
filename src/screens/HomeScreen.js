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
import { deleteDoc } from '../services/fileSystem';
import DocCard from '../components/DocCard';
import Header from '../components/Header';
import { useLanguage } from '../i18n/LanguageContext';
import { ALL_DOC_TYPES, isPremiumDocType } from '../constants/docTypes';
import { usePremium } from '../iap/PremiumContext';
import { Ionicons } from '@expo/vector-icons';


export default function HomeScreen({ navigation }) {
    const [docs, setDocs] = React.useState({});
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

    return (
        <SafeAreaView style={styles.safe}>
            <Header subtitle={t('header.home')} />

            <ScrollView
                style={styles.body}
                contentContainerStyle={{ gap: 12 }}
            >
                <Text style={styles.sectionLabel}>{t('home.sectionLabel')}</Text>

                {ALL_DOC_TYPES.map((docType) => {
                    const locked = isPremiumDocType(docType) && !isPremium;

                    if (locked) {
                        return (
                            <TouchableOpacity
                                key={docType}
                                style={styles.lockedCard}
                                onPress={() => navigation.navigate('Premium')}
                            >
                                <View>
                                    <Text style={styles.lockedType}>
                                        {t(`docs.${docType}`)}
                                    </Text>
                                    <Text style={styles.lockedText}>
                                        {t('premium.tapToUnlock')}
                                    </Text>
                                </View>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={20}
                                    color={colors.accent}
                                />
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <DocCard
                            key={docType}
                            docType={docType}
                            doc={docs[docType]}
                            onPress={() => handleDocPress(docType)}
                            onDelete={() => handleDelete(docType)}
                        />
                    );
                })}

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
    shareBtnText: { color: '#1a1200', fontSize: 15, fontWeight: '600' },
    lockedCard: {
        minHeight: 86,
        backgroundColor: colors.bgCard,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
    },
    lockedType: {
        color: colors.textMuted,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 4
    },
    lockedText: {
        color: colors.accent,
        fontSize: 14,
        fontWeight: '600'
    }
});
