//Might be needed to zip files, but most likley not
/* import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, getArchive } from './storage';

const EXPORT_DIR = FileSystem.cacheDirectory + 'cdl_wallet_export/';

const ensureExportDir = async () => {
    await FileSystem.makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
};

const clearExportDir = async () => {
    const info = await FileSystem.getInfoAsync(EXPORT_DIR);
    if (info.exists) {
        await FileSystem.deleteAsync(EXPORT_DIR, { idempotent: true });
    }
    await FileSystem.makeDirectoryAsync(EXPORT_DIR, { intermediates: true });
};

export const exportAllData = async () => {
    try {
        await clearExportDir();

        const docs = await getDocs();
        const archive = await getArchive();

        // Copy active doc files into export folder
        for (const [docType, doc] of Object.entries(docs)) {
            if (doc?.localUri) {
                const info = await FileSystem.getInfoAsync(doc.localUri);
                if (info.exists) {
                    const filename = `active_${docType}.enc`;
                    await FileSystem.copyAsync({
                        from: doc.localUri,
                        to: EXPORT_DIR + filename
                    });
                }
            }
        }

        // Copy archived doc files
        for (const entry of archive) {
            if (entry?.localUri) {
                const info = await FileSystem.getInfoAsync(entry.localUri);
                if (info.exists) {
                    const filename = `archive_${entry.id}.enc`;
                    await FileSystem.copyAsync({
                        from: entry.localUri,
                        to: EXPORT_DIR + filename
                    });
                }
            }
        }

        // Write metadata JSON
        const metadata = {
            exportedAt: new Date().toISOString(),
            docs,
            archive
        };
        await FileSystem.writeAsStringAsync(
            EXPORT_DIR + 'metadata.json',
            JSON.stringify(metadata, null, 2)
        );

        // Share the export directory as a zip isn't natively supported,
        // so we share the metadata file and instruct user to back up the folder.
        // For a real zip, add react-native-zip-archive.
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            throw new Error('Sharing is not available on this device');
        }

        await Sharing.shareAsync(EXPORT_DIR + 'metadata.json', {
            mimeType: 'application/json',
            dialogTitle: 'Export CDL Wallet Data'
        });

        return true;
    } catch (e) {
        throw new Error(`Export failed: ${e.message}`);
    }
}; */