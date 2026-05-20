import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    getDocs,
    saveDoc,
    getArchive,
    archiveDoc,
    deleteArchivedDoc
} from '../services/storage';
import { deleteDoc, saveDocFile, moveToArchive } from '../services/fileSystem';
import {
    scheduleExpiryReminders,
    cancelDocReminders
} from '../services/notifications';
import { useLanguage } from '../i18n/LanguageContext';

// Central hook that manages all document state across the app.
// Any screen that needs to read or mutate docs should use this
// instead of calling storage services directly.

export const useDocs = ({ autoLoad = true } = {}) => {
    const { t } = useLanguage();
    const [docs, setDocs] = useState({});
    const [archive, setArchive] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reload docs every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (autoLoad) {
                loadAll();
            }
        }, [autoLoad, t])
    );

    const loadAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [docsData, archiveData] = await Promise.all([
                getDocs(),
                getArchive()
            ]);
            setDocs(docsData);
            setArchive(archiveData);
        } catch (e) {
            const msg = t('docErrors.load', { message: e.message });
            setError(msg);
            Alert.alert(t('common.error'), msg);
        } finally {
            setLoading(false);
        }
    };

    // Upload a new doc image, save to file system, store metadata,
    // schedule notifications. Automatically archives the previous doc.
    const uploadDoc = async (docType, sourceUri, expiryDate) => {
        setLoading(true);
        setError(null);
        try {
            const existingDocs = await getDocs();
            const existing = existingDocs[docType];

            if (existing?.localUri) {
                const archivedUri = await moveToArchive(
                    docType,
                    existing.localUri
                );

                await archiveDoc(docType, {
                    ...existing,
                    localUri: archivedUri
                });
            }

            const localUri = await saveDocFile(docType, sourceUri);

            await saveDoc(docType, {
                localUri,
                expiryDate,
                uploadedAt: new Date().toISOString()
            });

            // Schedule 30-day and 10-day push notifications
            await scheduleExpiryReminders(docType, expiryDate);

            // Reload state so all screens reflect the update
            await loadAll();

            return true;
        } catch (e) {
            const msg = t('docErrors.save', { message: e.message });
            setError(msg);
            Alert.alert(t('common.error'), msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Delete active doc — cancels notifications and removes file
    const removeDoc = async (docType) => {
        setLoading(true);
        setError(null);
        try {
            await cancelDocReminders(docType);
            await deleteDoc(docType);
            await loadAll();
            return true;
        } catch (e) {
            const msg = t('docErrors.delete', { message: e.message });
            setError(msg);
            Alert.alert(t('common.error'), msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Delete one entry from the archive
    const removeArchivedDoc = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteArchivedDoc(id);
            // Optimistic update — remove from local state immediately
            setArchive((prev) => prev.filter((d) => d.id !== id));
            return true;
        } catch (e) {
            const msg = t('docErrors.deleteArchived', { message: e.message });
            setError(msg);
            Alert.alert(t('common.error'), msg);
            // Reload to restore accurate state if optimistic update was wrong
            await loadAll();
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Convenience getters
    const cdl = docs['cdl'] || null;
    const medCard = docs['med_card'] || null;
    const hasAnyDoc = !!(cdl || medCard);
    const archiveByType = (docType) =>
        archive.filter((d) => d.docType === docType);

    return {
        // State
        docs,
        archive,
        loading,
        error,

        // Convenience
        cdl,
        medCard,
        hasAnyDoc,
        archiveByType,

        // Actions
        loadAll,
        uploadDoc,
        removeDoc,
        removeArchivedDoc
    };
};
