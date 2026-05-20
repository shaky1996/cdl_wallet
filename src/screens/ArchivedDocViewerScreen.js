import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert,
    Modal,
    Animated
} from 'react-native';

import { theme } from '../styles/theme';
import { common } from '../styles/common';
import { loadDocFileBase64 } from '../services/fileSystem';
import { deleteArchivedDoc } from '../services/storage';
import BackButtonBar from '../components/BackButtonBar';
import { formatPrettyDate } from '../utils/dateHelpers';
import * as Sharing from 'expo-sharing';
import { imageToPdf } from '../services/pdfExport';
import StatusBadge from '../components/StatusBadge';
import { useLanguage } from '../i18n/LanguageContext';



export default function ArchivedDocViewerScreen({ navigation, route }) {
    const { item } = route.params;
    const { locale, t } = useLanguage();
    const docLabel = t(`docs.${item.docType}`);

    const [imageBase64, setImageBase64] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const opacity = useState(new Animated.Value(0))[0];
    const scale = useState(new Animated.Value(0.95))[0];

    useEffect(() => {
        loadImage();
    }, []);

    const loadImage = async () => {
        try {
            const b64 = await loadDocFileBase64(item.localUri);
            setImageBase64(b64);
        } catch (e) {
            Alert.alert(t('common.error'), t('viewer.couldNotLoadImage'));
        } finally {
            setLoading(false);
        }
    };

    const openFullScreen = () => {
        setIsFullScreen(true);
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 7,
                useNativeDriver: true
            })
        ]).start();
    };

    const closeFullScreen = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(scale, {
                toValue: 0.95,
                duration: 150,
                useNativeDriver: true
            })
        ]).start(() => {
            setIsFullScreen(false);
        });
    };

    const handleDelete = () => {
        Alert.alert(
            t('viewer.deleteTitle'),
            t('viewer.archivedDeleteMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await deleteArchivedDoc(item.id);
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            const pdf = await imageToPdf(
                { temp: item },
                { temp: docLabel }
            );
            await Sharing.shareAsync(pdf);
        } catch (e) {
            Alert.alert(t('common.error'), t('viewer.archivedShareError'));
        }
    };

    const status = 'archived';

    return (
        <SafeAreaView style={common.safeArea}>
            <BackButtonBar
                title={t('docs.oldDocument', { docLabel })}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={common.screenBody}
                contentContainerStyle={styles.scrollContent}
            >
                {/* IMAGE */}
                <View style={styles.docFrame}>
                    {loading ? (
                        <View style={styles.imagePlaceholder}>
                            <ActivityIndicator color={theme.colors.accent} />
                        </View>
                    ) : imageBase64 ? (
                        <TouchableOpacity onPress={openFullScreen}>
                            <Image
                                source={{
                                    uri: `data:image/jpeg;base64,${imageBase64}`
                                }}
                                style={styles.docImage}
                                resizeMode='cover'
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imageError}>
                                {t('viewer.couldNotLoadImage')}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.fullScreenHint}>
                        {t('viewer.fullScreenHint')}
                    </Text>
                </View>

                {/* INFO PANEL */}

                <View style={styles.infoPanel}>
                    <View style={[styles.infoRow, styles.infoDivider]}>
                        <Text style={styles.infoLabel}>{t('viewer.status')}</Text>

                        <StatusBadge status={status} />
                    </View>
                    <View style={[styles.infoRow, styles.infoDivider]}>
                        <Text style={styles.infoLabel}>
                            {t('viewer.expirationDate')}
                        </Text>
                        <Text style={styles.infoVal}>
                            {formatPrettyDate(item.expiryDate, locale)}
                        </Text>
                    </View>
                    <View style={[styles.infoRow, styles.infoDivider]}>
                        <Text style={styles.infoLabel}>
                            {t('viewer.addedToArchive')}
                        </Text>
                        <Text style={styles.infoVal}>
                            {formatPrettyDate(item.archivedAt, locale)}
                        </Text>
                    </View>
                </View>

                {/* ACTIONS */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnPrimary]}
                        onPress={handleShare}
                    >
                        <Text style={styles.actionBtnTextPrimary}>
                            {t('common.share')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            { borderColor: theme.colors.red + '66' }
                        ]}
                        onPress={handleDelete}
                    >
                        <Text
                            style={[
                                styles.actionBtnText,
                                { color: theme.colors.red }
                            ]}
                        >
                            {t('viewer.delete')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* FULLSCREEN MODAL */}
            {isFullScreen && (
                <Modal transparent>
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: 'black',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity
                        }}
                    >
                        <TouchableOpacity
                            style={{ flex: 1, width: '100%' }}
                            activeOpacity={1}
                            onPress={closeFullScreen}
                        >
                            <Animated.Image
                                source={{
                                    uri: `data:image/jpeg;base64,${imageBase64}`
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    transform: [{ scale }]
                                }}
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
        gap: theme.spacing.md
    },

    // IMAGE
    docFrame: {
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.bgCard,
        position: 'relative'
    },
    docImage: {
        width: '100%',
        height: 220
    },
    imagePlaceholder: {
        height: 220,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageError: {
        color: theme.colors.textMuted,
        fontSize: theme.font.md
    },
    fullScreenHint: {
        position: 'absolute',
        bottom: 8,
        right: 10,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20
    },

    // INFO PANEL
    infoPanel: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.lg,
        borderWidth: 0.5,
        borderColor: theme.colors.border,
        overflow: 'hidden'
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md
    },
    infoLabel: {
        color: theme.colors.textMuted,
        fontSize: theme.font.md
    },
    infoVal: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.md,
        fontWeight: '500'
    },
    infoDivider: {
        borderTopWidth: 0.5,
        borderTopColor: theme.colors.border
    },

    // ACTIONS
    actionRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm
    },
    actionBtn: {
        flex: 1,
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        alignItems: 'center'
    },
    actionBtnPrimary: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent
    },
    actionBtnText: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.md,
        fontWeight: '500'
    },
    actionBtnTextPrimary: {
        color: '#1a1200',
        fontSize: theme.font.md,
        fontWeight: '600'
    }
});
