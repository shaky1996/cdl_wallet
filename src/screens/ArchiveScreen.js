import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { common } from '../styles/common';
import { getArchive, deleteArchivedDoc } from '../services/storage';
import { formatPrettyDate } from '../utils/dateHelpers';
import { DOC_LABELS } from '../constants/docTypes';
import { useAsyncError } from '../hooks/useAsyncError';
import Header from '../components/Header';

export default function ArchiveScreen({ navigation }) {
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
            Alert.alert('Error', `Could not load archive: ${e.message}`);
        } finally {
            setLoadingArchive(false);
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            'Delete archived document',
            `Permanently delete this expired ${DOC_LABELS[item.docType]}? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () =>
                        run(() => deleteArchivedDoc(item.id), {
                            onSuccess: () =>
                                setArchive((prev) =>
                                    prev.filter((d) => d.id !== item.id)
                                ),
                            errorMessage:
                                'Could not delete this document. Please try again.'
                        })
                }
            ]
        );
    };

    const handleView = (item) => {
        navigation.navigate('ArchivedDocViewer', { item });
    };

    const groupedByType = archive.reduce((acc, item) => {
        const key = item.docType;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const renderItem = ({ item }) => (
        <View style={styles.archiveCard}>
            <View style={styles.cardHeader}>
                <View style={styles.docThumb}>
                    <Text style={styles.thumbText}>
                        {item.docType === 'cdl' ? 'CDL' : 'MED'}
                    </Text>
                </View>
                <View style={styles.cardMeta}>
                    <Text style={styles.cardName}>
                        {DOC_LABELS[item.docType]}
                    </Text>
                    <Text style={styles.cardDates}>
                        Expired {formatPrettyDate(item.expiryDate)}
                        {item.archivedAt
                            ? ` · Replaced ${formatPrettyDate(item.archivedAt)}`
                            : ''}
                    </Text>
                </View>
                <View style={styles.expiredBadge}>
                    <Text style={styles.expiredBadgeText}>Expired</Text>
                </View>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.cardAction, styles.cardActionLeft]}
                    onPress={() => handleView(item)}
                >
                    <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cardAction}
                    onPress={() => handleDelete(item)}
                    disabled={loading}
                >
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loadingArchive) {
        return (
            <SafeAreaView style={common.safeArea}>
                <ActivityIndicator
                    color={theme.colors.accent}
                    style={{ flex: 1 }}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={common.safeArea}>
            <Header subtitle='Archive' />
            

            {archive.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No archived documents</Text>
                    <Text style={styles.emptySub}>
                        When you replace a CDL or med card, the old one is saved
                        here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={archive}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.infoBanner}>
                            <Text style={styles.infoBannerText}>
                                Carriers sometimes ask for proof of a prior
                                valid document. Keeping archived docs saves you
                                a trip to the DMV.
                            </Text>
                        </View>
                    }
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 8 }} />
                    )}
                />
            )}
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
    list: {
        flex: 1,
        backgroundColor: theme.colors.bgBody
    },
    listContent: {
        padding: theme.spacing.lg,
        paddingBottom: 40,
        gap: 8
    },
    infoBanner: {
        backgroundColor: '#1a1f2e',
        borderRadius: theme.radius.md,
        borderWidth: 0.5,
        borderColor: theme.colors.blue,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md
    },
    infoBannerText: {
        color: theme.colors.blue,
        fontSize: 12,
        lineHeight: 18
    },
    archiveCard: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md
    },
    docThumb: {
        width: 44,
        height: 32,
        borderRadius: 6,
        backgroundColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    thumbText: {
        color: theme.colors.textMuted,
        fontSize: 10,
        fontWeight: '600'
    },
    cardMeta: {
        flex: 1
    },
    cardName: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.base,
        fontWeight: '500'
    },
    cardDates: {
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 2
    },
    expiredBadge: {
        backgroundColor: '#2a1a1a',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: theme.colors.red + '88',
        paddingHorizontal: 8,
        paddingVertical: 3
    },
    expiredBadgeText: {
        color: theme.colors.red,
        fontSize: 10,
        fontWeight: '600'
    },
    cardActions: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: theme.colors.border
    },
    cardAction: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center'
    },
    cardActionLeft: {
        borderRightWidth: 0.5,
        borderRightColor: theme.colors.border
    },
    viewText: {
        color: theme.colors.accent,
        fontSize: 12,
        fontWeight: '500'
    },
    deleteText: {
        color: theme.colors.red,
        fontSize: 12,
        fontWeight: '500'
    },
    emptyState: {
        flex: 1,
        backgroundColor: theme.colors.bgBody,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
    },
    emptyTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.lg,
        fontWeight: '500',
        marginBottom: 8
    },
    emptySub: {
        color: theme.colors.textMuted,
        fontSize: theme.font.md,
        textAlign: 'center',
        lineHeight: 22
    }
});
