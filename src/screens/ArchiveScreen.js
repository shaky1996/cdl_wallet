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
                        Old {DOC_LABELS[item.docType]}
                    </Text>

                    <Text style={styles.cardDates}>
                        Expiration date: {formatPrettyDate(item.expiryDate)}
                    </Text>

                    {item.archivedAt ? (
                        <Text style={styles.cardDates}>
                            Added to archive:{' '}
                            {formatPrettyDate(item.archivedAt)}
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
                    <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cardAction}
                    onPress={(e) => {
                        e?.stopPropagation?.();
                        handleDelete(item);
                    }}
                    disabled={loading}
                >
                    <Text style={styles.deleteText}>Delete</Text>
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
            <Header subtitle='Archive' />

            <View style={styles.body}>
                <Text style={styles.label}>Archived documents</Text>

                <View style={styles.infoBanner}>
                    <Text style={styles.infoText}>
                        Carriers sometimes ask for proof of a prior valid
                        document. Keeping archived docs saves you a trip to the
                        DMV.
                    </Text>
                </View>

                {archive.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            No archived documents
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

    infoBanner: {
        backgroundColor: '#1a1f2e',
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: colors.blue,
        padding: 12
    },

    infoText: {
        color: colors.blue,
        fontSize: 12,
        lineHeight: 18
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
    }
});
