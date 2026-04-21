import AsyncStorage from '@react-native-async-storage/async-storage';

const DOCS_KEY = 'cdl_wallet_docs';
const ARCHIVE_KEY = 'cdl_wallet_archive';

export const getDocs = async () => {
    const raw = await AsyncStorage.getItem(DOCS_KEY);
    return raw ? JSON.parse(raw) : {};
};

const normalizeDate = (dateStr) => {
    if (!dateStr) return null;

    // If ISO → convert to YYYY-MM-DD
    if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    }

    return dateStr; // already YYYY-MM-DD
};

export const saveDoc = async (docType, docData) => {
    const docs = await getDocs();

    docs[docType] = {
        ...docData,
        expiryDate: normalizeDate(docData.expiryDate), // 🔥 FIX HERE
        updatedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem(DOCS_KEY, JSON.stringify(docs));
};

export const getArchive = async () => {
    const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
};

export const archiveDoc = async (docType, docData) => {
    const archive = await getArchive();
    archive.unshift({
        ...docData,
        docType,
        archivedAt: new Date().toISOString(),
        id: Date.now().toString()
    });
    await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
};

export const deleteArchivedDoc = async (id) => {
    const archive = await getArchive();
    const updated = archive.filter((d) => d.id !== id);
    await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(updated));
};

