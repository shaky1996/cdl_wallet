import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';

import { theme } from '../styles/theme';
import { common } from '../styles/common';
import { loadDocFileBase64 } from '../services/fileSystem';
import { deleteArchivedDoc } from '../services/storage';
import { DOC_LABELS } from '../constants/docTypes';
import BackButtonBar from '../components/BackButtonBar';
import { formatPrettyDate } from '../utils/dateHelpers';
import * as Sharing from 'expo-sharing';
import { imageToPdf } from '../services/pdfExport';

export default function ArchivedDocViewerScreen({ navigation, route }) {
    const { item } = route.params;

    const [imageBase64, setImageBase64] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadImage();
    }, []);

    const loadImage = async () => {
        try {
            const b64 = await loadDocFileBase64(item.localUri);
            setImageBase64(b64);
        } catch (e) {
            Alert.alert('Error', 'Could not load image');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete document',
            'Are you sure you want to delete this archived document?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
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
                { temp: item }, // fake object
                { temp: DOC_LABELS[item.docType] }
            );

            await Sharing.shareAsync(pdf);
        } catch (e) {
            Alert.alert('Error', 'Could not share document');
        }
    };

    return (
        <SafeAreaView style={common.safeArea}>
            <BackButtonBar
                title={DOC_LABELS[item.docType]}
                onBack={() => navigation.goBack()}
            />

            <View style={{ padding: 16 }}>
                {loading ? (
                    <ActivityIndicator color={theme.colors.accent} />
                ) : imageBase64 ? (
                    <Image
                        source={{
                            uri: `data:image/jpeg;base64,${imageBase64}`
                        }}
                        style={styles.image}
                        resizeMode='cover'
                    />
                ) : (
                    <Text style={{ color: 'white' }}>Failed to load</Text>
                )}

                {/* INFO */}
                <View style={styles.infoBox}>
                    <Text style={styles.label}>Expires</Text>
                    <Text style={styles.value}>
                        {formatPrettyDate(item.expiryDate)}
                    </Text>
                </View>

                {/* ACTIONS */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={handleShare}
                    >
                        <Text style={styles.btnText}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.deleteBtn]}
                        onPress={handleDelete}
                    >
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        marginBottom: 16
    },
    infoBox: {
        backgroundColor: theme.colors.bgCard,
        padding: 12,
        borderRadius: 10,
        marginBottom: 16
    },
    label: {
        color: theme.colors.textMuted,
        fontSize: 12
    },
    value: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '500'
    },
    actions: {
        flexDirection: 'row',
        gap: 10
    },
    btn: {
        flex: 1,
        backgroundColor: theme.colors.accent,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center'
    },
    btnText: {
        color: '#1a1200',
        fontWeight: '600'
    },
    deleteBtn: {
        backgroundColor: '#2a1a1a'
    },
    deleteText: {
        color: theme.colors.red,
        fontWeight: '600'
    }
});
