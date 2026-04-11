import * as FileSystem from 'expo-file-system/legacy';

const DOCS_DIR = FileSystem.documentDirectory + 'docs/';
const ARCHIVE_DIR = FileSystem.documentDirectory + 'archive/';

const ensureDirs = async () => {
    await FileSystem.makeDirectoryAsync(DOCS_DIR, { intermediates: true });
    await FileSystem.makeDirectoryAsync(ARCHIVE_DIR, { intermediates: true });
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
