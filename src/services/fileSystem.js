import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs } from './storage';


const DOCS_DIR = FileSystem.documentDirectory + 'docs/';
const ARCHIVE_DIR = FileSystem.documentDirectory + 'archive/';
const DOCS_KEY = 'cdl_wallet_docs';

const ensureDirs = async () => {
    await FileSystem.makeDirectoryAsync(DOCS_DIR, { intermediates: true });
    await FileSystem.makeDirectoryAsync(ARCHIVE_DIR, { intermediates: true });
};

export const loadDocFileBase64 = async (uri) => {
    return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
    });
};

// Save a new doc image to docs/ directory
export const saveDocFile = async (docType, sourceUri) => {
    await ensureDirs();
    const ext = sourceUri.split('.').pop().split('?')[0] || 'jpg';
    const dest = DOCS_DIR + `${docType}.${ext}`;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    return dest;
};

// Move active doc to archive/ before replacing
export const moveToArchive = async (docType, localUri) => {
    await ensureDirs();
    const filename = `${docType}_${Date.now()}.jpg`;
    const dest = ARCHIVE_DIR + filename;
    await FileSystem.moveAsync({ from: localUri, to: dest });
    return dest;
};

// Delete an archived file
export const deleteArchivedFile = async (localUri) => {
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) await FileSystem.deleteAsync(localUri);
};



export const deleteDoc = async (docType) => {
    const raw = await AsyncStorage.getItem(DOCS_KEY);
    const docs = raw ? JSON.parse(raw) : {};

    const doc = docs[docType];

    // delete file if exists
    if (doc?.localUri) {
        await FileSystem.deleteAsync(doc.localUri, { idempotent: true });
    }

    // remove from storage
    delete docs[docType];

    await AsyncStorage.setItem(DOCS_KEY, JSON.stringify(docs));

    return docs;
};




// Reset file storage
// export const resetAppData = async () => {
//     await AsyncStorage.clear();
//     console.log('AsyncStorage cleared');
// };

// FileSystem.documentDirectory + 'docs/';
// FileSystem.documentDirectory + 'archive/';

// export const resetFiles = async () => {
//     const docs = FileSystem.documentDirectory + 'docs/';
//     const archive = FileSystem.documentDirectory + 'archive/';

//     await FileSystem.deleteAsync(docs, { idempotent: true });
//     await FileSystem.deleteAsync(archive, { idempotent: true });
// };

// resetAppData();
// resetFiles();