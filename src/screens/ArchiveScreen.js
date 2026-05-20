import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Alert,
    ActivityIndicator,
    Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../constants/colors';
import { getArchive, deleteArchivedDoc } from '../services/storage';
import { deleteArchivedFile } from '../services/fileSystem';
import { formatPrettyDate } from '../utils/dateHelpers';
import { useAsyncError } from '../hooks/useAsyncError';
import Header from '../components/Header';
import InfoBanner from '../components/InfoBanner';
import { useLanguage } from '../i18n/LanguageContext';

export default function ArchiveScreen({ navigation }) {
    const { locale, t } = useLanguage();
    const [archive, setArchive] = useState([]);
    const [loadingArchive, setLoadingArchive] = useState(true);
    const { loading, run } = useAsyncError();

    useFocusEffect(
        useCallback(() => {
            loadArchive();
        }, [])
    );

    const loadArchive = async () => {
        try {
            setLoadingArchive(true);
            const data = await getArchive();
            setArchive(data);
        } catch (e) {
            Alert.alert(
                t('common.error'),
                t('archive.loadError', { message: e.message })
            );
        } finally {
            setLoadingArchive(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            t('archive.deleteTitle'),
            t('archive.deleteMessage', {
                docLabel: t(`docs.${item.docType}`)
            }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () =>
                        run(async () => {
                            await deleteArchivedFile(item.localUri);
                            await deleteArchivedDoc(item.id);
                        }, {
                            onSuccess: () =>
                                setArchive((prev) =>
                                    prev.filter((d) => d.id !== item.id)
                                ),
                            errorMessage:
                                t('archive.deleteError')
                        })
                }
            ]
        );
    };

    const handleView = (item) => {
        navigation.navigate('ArchivedDocViewer', { item });
    };

    const handleUploadOldDocument = () => {
        navigation.navigate('ArchiveUpload', { archiveOnly: true });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleView(item)}
            style={styles.archiveCard}
        >
            {/* HEADER */}
            <View style={styles.cardHeader}>
                <Image
                    source={{ uri: item.localUri }}
                    style={styles.docThumbImage}
                    resizeMode='cover'
                />

                <View style={styles.cardMeta}>
                    <Text style={styles.cardName}>
                        {t('docs.oldDocument', {
                            docLabel: t(`docs.${item.docType}`)
                        })}
                    </Text>

                    <Text style={styles.cardDates}>
                        {t('archive.expirationDate', {
                            date: formatPrettyDate(item.expiryDate, locale)
                        })}
                    </Text>

                    {item.archivedAt ? (
                        <Text style={styles.cardDates}>
                            {t('archive.addedToArchive', {
                                date: formatPrettyDate(item.archivedAt, locale)
                            })}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* ACTIONS */}
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.cardAction, styles.cardActionLeft]}
                    onPress={(e) => {
                        e?.stopPropagation?.();
                        handleView(item);
                    }}
                >
                    <Text style={styles.viewText}>{t('archive.view')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cardAction}
                    onPress={(e) => {
                        e?.stopPropagation?.();
                        handleDelete(item);
                    }}
                    disabled={loading}
                >
                    <Text style={styles.deleteText}>{t('common.delete')}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loadingArchive) {
        return (
            <SafeAreaView style={styles.safe}>
                <ActivityIndicator
                    color={colors.accent}
                    style={{ flex: 1 }}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <Header subtitle={t('header.archive')} />

            <View style={styles.body}>
                <Text style={styles.label}>{t('archive.archivedDocuments')}</Text>


                <InfoBanner
                    text={
                        t('archive.info')
                    }
                    color={colors.blue}
                    backgroundColor={'#1a1f2e'}
                />

                <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={handleUploadOldDocument}
                >
                    <Text style={styles.uploadBtnText}>
                        {t('archive.uploadOldDocument')}
                    </Text>
                </TouchableOpacity>
            
                {archive.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            {t('archive.empty')}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={archive}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 8 }} />
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.bg
    },

    body: {
        flex: 1,
        backgroundColor: colors.bgBody,
        padding: 16,
        gap: 8
    },

    label: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4
    },

    listContent: {
        paddingTop: 8,
        paddingBottom: 40
    },

    archiveCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden'
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14
    },

    docThumbImage: {
        width: 64,
        height: 44,
        borderRadius: 6,
        backgroundColor: colors.border
    },

    cardMeta: {
        flex: 1
    },

    cardName: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '500'
    },

    cardDates: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2
    },

    cardActions: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: colors.border
    },

    cardAction: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center'
    },

    cardActionLeft: {
        borderRightWidth: 0.5,
        borderRightColor: colors.border
    },

    viewText: {
        color: colors.accent,
        fontSize: 12,
        fontWeight: '500'
    },

    deleteText: {
        color: colors.red,
        fontSize: 12,
        fontWeight: '500'
    },

    emptyState: {
        marginTop: 40,
        alignItems: 'center'
    },

    emptyText: {
        color: colors.textMuted,
        fontSize: 14
    },

    uploadBtn: {
        backgroundColor: colors.accent,
        marginTop: 12,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center'
    },

    uploadBtnText: {
        color: '#1a1200',
        fontSize: 14,
        fontWeight: '600'
    }
});
