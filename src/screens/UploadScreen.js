import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView,
    ActivityIndicator,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { theme } from '../styles/theme';
import { common } from '../styles/common';
import { saveDocFile } from '../services/fileSystem';
import { saveDoc } from '../services/storage';
import { scheduleExpiryReminders } from '../services/notifications';
import { useAsyncError } from '../hooks/useAsyncError';
import { DOC_LABELS } from '../constants/docTypes';

export default function UploadScreen({ navigation, route }) {
    const { docType } = route.params;
    const docLabel = DOC_LABELS[docType];

    const [imageUri, setImageUri] = useState(null);
    const [expiryDate, setExpiryDate] = useState('');
    const [ocrDetected, setOcrDetected] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const isDisabled = loading || !imageUri;

    const { loading, run } = useAsyncError();

    const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

    const cropImage = async (uri) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [],
                {
                    compress: 0.9,
                    format: ImageManipulator.SaveFormat.JPEG
                }
            );

            const { width, height } = manipResult;

            const cropWidth = width * 0.99; 
            const cropHeight = height * 0.99; 

            const result = await ImageManipulator.manipulateAsync(
                uri,
                [
                    {
                        crop: {
                            originX: (width - cropWidth) / 2,
                            originY: (height - cropHeight) / 2,
                            width: cropWidth,
                            height: cropHeight
                        }
                    }
                ],
                {
                    compress: 0.9,
                    format: ImageManipulator.SaveFormat.JPEG
                }
            );

            return result.uri;
        } catch (e) {
            console.log('Crop failed:', e);
            return uri;
        }
    };

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Camera access needed',
                'Please allow camera access in Settings to take a photo of your document.'
            );
            return false;
        }
        return true;
    };

    const requestGalleryPermission = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Gallery access needed',
                'Please allow photo library access in Settings.'
            );
            return false;
        }
        return true;
    };

    const handleCamera = async () => {
        const granted = await requestCameraPermission();
        if (!granted) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true
        });

        if (!result.canceled && result.assets?.[0]) {
            const uri = result.assets[0].uri;
            const cropped = await cropImage(uri);
            setImageUri(cropped);
        }
    };

    const handleGallery = async () => {
        const granted = await requestGalleryPermission();
        if (!granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true
        });

        if (!result.canceled && result.assets?.[0]) {
            const uri = result.assets[0].uri;
            const cropped = await cropImage(uri);
            setImageUri(cropped);
            setOcrDetected(false);
        }
    };

    const handleFilePicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;
            const uri = result.assets?.[0]?.uri;
            if (!uri) return;

            setImageUri(uri);
            setOcrDetected(false);
        } catch (e) {
            Alert.alert(
                'Error',
                'Could not open file picker. Please try again.'
            );
        }
    };

    

    const validateExpiryDate = (dateStr) => {
        if (!dateStr.trim()) return 'Please enter the expiry date.';
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime()))
            return 'Invalid date format. Use YYYY-MM-DD.';
        return null;
    };

    const onDateChange = (event, selectedDate) => {

        if (selectedDate) {
            setTempDate(selectedDate)
        }
    };

    const handleSave = () => {
        if (!imageUri) {
            Alert.alert(
                'No document',
                'Please take a photo or pick a file first.'
            );
            return;
        }

        const validationError = validateExpiryDate(expiryDate);
        if (validationError) {
            Alert.alert('Check expiry date', validationError);
            return;
        }

        run(
            async () => {
                const localUri = await saveDocFile(docType, imageUri);
                await saveDoc(docType, {
                    localUri,
                    expiryDate,
                    uploadedAt: new Date().toISOString(),
                    label: docLabel
                });
                await scheduleExpiryReminders(docType, expiryDate);
            },
            {
                onSuccess: () => {
                    Alert.alert(
                        'Saved',
                        `Your ${docLabel} has been saved.`,
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                },
                errorMessage: `Could not save your ${docLabel}. Please try again.`
            }
        );
    };

    return (
        <SafeAreaView style={common.safeArea}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Upload {docLabel}</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView
                style={common.screenBody}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
            >
                <Text style={styles.label}>Document image</Text>

                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.preview}
                        resizeMode='cover'
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>
                            No document selected
                        </Text>
                    </View>
                )}

                <View style={styles.sourceRow}>
                    <TouchableOpacity
                        style={styles.sourceBtn}
                        onPress={handleCamera}
                    >
                        <Text style={styles.sourceBtnText}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sourceBtn}
                        onPress={handleGallery}
                    >
                        <Text style={styles.sourceBtnText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.sourceBtn}
                        onPress={handleFilePicker}
                    >
                        <Text style={styles.sourceBtnText}>PDF file</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { marginTop: 20 }]}>
                    Expiry date
                </Text>

                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowPicker(true)}
                >
                    <View style={styles.dateInputWrap}>
                        <Text style={styles.dateInputLabel}>YYYY-MM-DD</Text>

                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowPicker(true)}
                        >
                            <Text
                                style={{
                                    color: expiryDate
                                        ? theme.colors.textPrimary
                                        : theme.colors.textMuted
                                }}
                            >
                                {expiryDate || 'e.g. 2026-03-14'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showPicker && (
                        <View style={styles.pickerContainer}>
                            {/* HEADER ROW */}
                            <View style={styles.pickerHeader}>
                                <Text style={styles.pickerTitle}>
                                    Select date
                                </Text>

                                <TouchableOpacity
                                    onPress={() => {
                                        const formatted =
                                            formatLocalDate(tempDate);
                                        setExpiryDate(formatted);
                                        setShowPicker(false);
                                        setOcrDetected(false);
                                    }}
                                >
                                    <Text style={styles.doneTopRight}>
                                        Done
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* CENTERED PICKER */}
                            <View style={styles.pickerBody}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode='date'
                                    display='spinner'
                                    onChange={(e, date) => {
                                        if (date) setTempDate(date);
                                    }}
                                    minimumDate={new Date()}
                                />
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                {expiryDate && !isNaN(new Date(expiryDate).getTime()) && (
                    <View style={styles.reminderPreview}>
                        <Text style={styles.reminderText}>
                            Reminders will be set 30 and 10 days before expiry.
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.saveBtn,
                        isDisabled && { opacity: 0.5, backgroundColor: '#ccc' }
                    ]}
                    onPress={handleSave}
                    disabled={isDisabled}
                >
                    {loading ? (
                        <ActivityIndicator color='#1a1200' />
                    ) : (
                        <Text style={styles.saveBtnText}>Save document ›</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.bg
    },
    backBtn: {
        color: theme.colors.accent,
        fontSize: theme.font.base,
        width: 60
    },
    screenTitle: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.lg,
        fontWeight: '500'
    },
    scrollContent: {
        paddingBottom: 40
    },
    label: {
        color: theme.colors.textMuted,
        fontSize: theme.font.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm
    },
    preview: {
        width: '100%',
        height: 250,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgCard,
        marginBottom: theme.spacing.sm
    },
    placeholder: {
        width: '100%',
        height: 250,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.bgCard,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm
    },
    placeholderText: {
        color: theme.colors.textMuted,
        fontSize: theme.font.md
    },
    sourceRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm
    },
    sourceBtn: {
        flex: 1,
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        alignItems: 'center'
    },
    sourceBtnText: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.md,
        fontWeight: '500'
    },
    ocrRunning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm
    },
    ocrRunningText: {
        color: theme.colors.textMuted,
        fontSize: theme.font.md
    },
    ocrBadge: {
        backgroundColor: '#0C447C',
        borderRadius: theme.radius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.sm
    },
    ocrBadgeText: {
        color: '#85B7EB',
        fontSize: theme.font.sm,
        fontWeight: '500'
    },
    dateInputWrap: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm
    },
    dateInputLabel: {
        color: theme.colors.textMuted,
        fontSize: 10,
        marginBottom: 4
    },
    dateInput: {
        color: theme.colors.textPrimary,
        fontSize: theme.font.base,
        fontWeight: '500'
    },
    reminderPreview: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.md,
        borderWidth: 0.5,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md
    },
    reminderText: {
        color: theme.colors.textMuted,
        fontSize: 12,
        lineHeight: 18
    },
    saveBtn: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        alignItems: 'center',
        marginTop: theme.spacing.sm
    },
    saveBtnText: {
        color: '#1a1200',
        fontSize: theme.font.lg,
        fontWeight: '600'
    },
    pickerContainer: {
    borderRadius: 12,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    backgroundColor: theme.colors.bgCard
},
    pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8
},

pickerBody: {
    alignItems: 'center',
    justifyContent: 'center'
},

pickerTitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500'
},

doneTopRight: {
    color: theme.colors.accent,
    fontSize: 18,
    fontWeight: '700'
}
});