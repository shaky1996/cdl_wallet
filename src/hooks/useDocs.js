import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    getDocs,
    saveDoc,
    deleteDoc,
    getArchive,
    deleteArchivedDoc
} from '../services/storage';
import { saveDocFile, moveToArchive } from '../services/fileSystem';
import {
    scheduleExpiryReminders,
    cancelDocReminders
} from '../services/notifications';

// Central hook that manages all document state across the app.
// Any screen that needs to read or mutate docs should use this
// instead of calling storage services directly.

export const useDocs = ({ autoLoad = true } = {}) => {
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
        }, [autoLoad])
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
            const msg = `Could not load documents: ${e.message}`;
            setError(msg);
            Alert.alert('Error', msg);
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
            // Save encrypted file to device
            const localUri = await saveDocFile(docType, sourceUri);

            // Save metadata — storage.js handles archiving the old doc internally
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
            const msg = `Could not save document: ${e.message}`;
            setError(msg);
            Alert.alert('Error', msg);
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
            const msg = `Could not delete document: ${e.message}`;
            setError(msg);
            Alert.alert('Error', msg);
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
            const msg = `Could not delete archived document: ${e.message}`;
            setError(msg);
            Alert.alert('Error', msg);
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
