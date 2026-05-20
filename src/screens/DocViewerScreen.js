import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
    Animated,
    } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { common } from '../styles/common';
import { getDocs } from '../services/storage';
import { deleteDoc } from '../services/fileSystem';
import { loadDocFileBase64 } from '../services/fileSystem';
import { cancelDocReminders } from '../services/notifications';
import {
    getStatus,
    daysUntil,
    formatPrettyDate,
} from '../utils/dateHelpers';
import StatusBadge from '../components/StatusBadge';
import ExpiryBar from '../components/ExpiryBar';
import { useAsyncError } from '../hooks/useAsyncError';
import { colors } from '../constants/colors';
import BackButtonBar from '../components/BackButtonBar';
import InfoBanner from '../components/InfoBanner';
import { useLanguage } from '../i18n/LanguageContext';



export default function DocViewerScreen({ navigation, route }) {
    const { docType } = route.params;
    const { locale, t } = useLanguage();
    const docLabel = t(`docs.${docType}`);

    const [doc, setDoc] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [side, setSide] = useState('front');
    const [loadingImage, setLoadingImage] = useState(true);
    const { loading, run } = useAsyncError();

    // ADDED
    const [isFullScreen, setIsFullScreen] = useState(false);
const opacity = useState(new Animated.Value(0))[0];
const scale = useState(new Animated.Value(0.95))[0];

 useFocusEffect(
    useCallback(() => {
        loadDoc();
    }, [])
 );

    const loadDoc = async () => {
        try {
            const docs = await getDocs();
            const found = docs[docType];
            if (!found) {
                Alert.alert(t('viewer.notFoundTitle'), t('viewer.notFoundMessage'));
                navigation.goBack();
                return;
            }
            setDoc(found);

            setLoadingImage(true);
            const b64 = await loadDocFileBase64(found.localUri);
            setImageBase64(b64);
        } catch (e) {
            Alert.alert(
                t('common.error'),
                t('viewer.loadError', { message: e.message })
            );
            navigation.goBack();
        } finally {
            setLoadingImage(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t('viewer.deleteTitle'),
            t('viewer.deleteMessage', { docLabel }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () =>
                        run(
                            async () => {
                                await cancelDocReminders(docType);
                                await deleteDoc(docType);
                            },
                            {
                                onSuccess: () => navigation.goBack(),
                                errorMessage: t('viewer.deleteError', { docLabel })
                            }
                        )
                }
            ]
        );
    };

    const handleReplace = () => {
        navigation.navigate('Upload', { docType });
    };

    const handleShare = () => {
        navigation.navigate('Share', {
            preselect: {
                [docType]: true
            }
        });
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

    if (!doc) {
        return (
            <SafeAreaView style={common.safeArea}>
                <ActivityIndicator
                    color={theme.colors.accent}
                    style={{ flex: 1 }}
                />
            </SafeAreaView>
        );
    }

    const status = getStatus(doc.expiryDate);

    return (
        <SafeAreaView style={common.safeArea}>
            {/* Top bar */}

            <BackButtonBar
                title={docLabel}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={common.screenBody}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Front / Back toggle */}
                {/* {docType === 'cdl' && (
                    <View style={styles.toggle}>
                        <TouchableOpacity
                            style={[
                                styles.toggleBtn,
                                side === 'front' && styles.toggleActive
                            ]}
                            onPress={() => setSide('front')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    side === 'front' && styles.toggleTextActive
                                ]}
                            >
                                Front side
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleBtn,
                                side === 'back' && styles.toggleActive
                            ]}
                            onPress={() => setSide('back')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    side === 'back' && styles.toggleTextActive
                                ]}
                            >
                                Back side
                            </Text>
                        </TouchableOpacity>
                    </View>
                )} */}

                {/* Document image */}
                <View style={styles.docFrame}>
                    {loadingImage ? (
                        <View style={styles.imagePlaceholder}>
                            <ActivityIndicator color={theme.colors.accent} />
                        </View>
                    ) : imageBase64 ? (
                        // ✅ ADDED TOUCHABLE ONLY
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

                {/* Info panel */}
                <View style={styles.infoPanel}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('viewer.status')}</Text>
                        <StatusBadge status={status} />
                    </View>

                    <View style={[styles.infoRow, styles.infoDivider]}>
                        <Text style={styles.infoLabel}>{t('viewer.expires')}</Text>
                        <Text style={styles.infoVal}>
                            {formatPrettyDate(doc.expiryDate, locale)}
                        </Text>
                    </View>

                    <View style={[styles.infoRow, styles.infoDivider]}>
                        <Text style={styles.infoLabel}>
                            {t('viewer.daysRemaining')}
                        </Text>
                        <Text
                            style={[
                                styles.infoVal,
                                {
                                    color:
                                        status === 'valid'
                                            ? theme.colors.green
                                            : status === 'expiring'
                                              ? theme.colors.amber
                                              : theme.colors.red
                                }
                            ]}
                        >
                            {daysUntil(doc.expiryDate) > 0
                                ? t('common.days', {
                                      count: daysUntil(doc.expiryDate)
                                  })
                                : t('common.expired')}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.infoRow,
                            styles.infoDivider,
                            {
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                gap: 8
                            }
                        ]}
                    >
                        <Text style={styles.infoLabel}>{t('viewer.validity')}</Text>
                        <ExpiryBar
                            uploadedAt={doc.uploadedAt}
                            expiryDate={doc.expiryDate}
                        />
                    </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={handleReplace}
                    >
                        <Text style={styles.actionBtnText}>{t('viewer.replace')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnPrimary]}
                        onPress={handleShare}
                    >
                        <Text style={styles.actionBtnTextPrimary}>{t('common.share')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            { borderColor: theme.colors.red + '66' }
                        ]}
                        onPress={handleDelete}
                        disabled={loading}
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
                <InfoBanner
                                    text={
                                        t('viewer.archiveInfo')
                                    }
                                    color={colors.blue}
                                    backgroundColor={'#1a1f2e'}
                                />
            </ScrollView>

            {/*FULLSCREEN MODAL */}
            {isFullScreen && (
                <Modal transparent>
                    <Animated.View
                        style={[
                            {
                                flex: 1,
                                backgroundColor: 'black',
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity
                            }
                        ]}
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
    // topBar: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     paddingHorizontal: theme.spacing.lg,
    //     paddingTop: theme.spacing.sm,
    //     paddingBottom: theme.spacing.md,
    //     backgroundColor: theme.colors.bg
    // },
    // header: {
    //     paddingHorizontal: 20,
    //     paddingTop: 10,
    //     paddingBottom: 16,
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center'
    // },
    // backBtn: {
    //     color: theme.colors.accent,
    //     fontSize: theme.font.lg,
    //     width: 60
    // },
    screenTitle: { color: colors.accent, fontSize: 24, fontWeight: '600' },
    scrollContent: {
        paddingBottom: 40,
        gap: theme.spacing.md
    },
    toggle: {
        flexDirection: 'row',
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.sm,
        padding: 3,
        gap: 3
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 7,
        borderRadius: 7,
        alignItems: 'center'
    },
    toggleActive: {
        backgroundColor: theme.colors.accent
    },
    toggleText: {
        color: theme.colors.textMuted,
        fontSize: theme.font.md,
        fontWeight: '500'
    },
    toggleTextActive: {
        color: '#1a1200'
    },
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
    statusOverlay: {
        position: 'absolute',
        top: 10,
        right: 10
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
    infoDivider: {
        borderTopWidth: 0.5,
        borderTopColor: theme.colors.border
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
