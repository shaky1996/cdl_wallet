import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { formatPrettyDate } from '../utils/dateHelpers';

const toBase64 = async (uri) => {
    return await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64'
    });
};

// 🔥 sanitize filename
const sanitizeFileName = (name) => {
    return name
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_');
};

export const imageToPdf = async (docs, docLabels) => {
    try {
        let pages = '';

        let firstDocLabel = null;
        let firstExpiry = null;

        for (const key of Object.keys(docs)) {
            const doc = docs[key];

            if (!doc?.localUri) continue;

            const base64 = await toBase64(doc.localUri);

            const ext = doc.localUri.split('.').pop().toLowerCase();
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

            const label = docLabels[key] || 'Document';

            // store first doc info for filename
            if (!firstDocLabel) {
                firstDocLabel = label;
                firstExpiry = doc.expiryDate;
            }

            pages += `
                <div style="page-break-after: always; text-align:center; padding:20px;">
                    <img 
                        src="data:${mime};base64,${base64}" 
                        style="width:100%; max-height:90vh; object-fit:contain;" 
                    />
                </div>
            `;
        }

        const html = `
            <html>
                <body style="margin:0; padding:0;">
                    ${pages}
                </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });

        //  build smart filename
        const expiryText = firstExpiry
            ? formatPrettyDate(firstExpiry)
            : 'No-Expiry';

        const fileName =
            sanitizeFileName(`${'Doc'} Expiration ${expiryText}`) + '.pdf';

        const finalPath = FileSystem.cacheDirectory + fileName;

        await FileSystem.moveAsync({
            from: uri,
            to: finalPath
        });

        return finalPath.startsWith('file://')
            ? finalPath
            : `file://${finalPath}`;
    } catch (e) {
        console.log('PDF ERROR:', e);
        throw e;
    }
};
