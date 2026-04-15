import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

const toBase64 = async (uri) => {
    const cleanUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    return await FileSystem.readAsStringAsync(cleanUri, {
        encoding: FileSystem.EncodingType.Base64
    });
};

export const imageToPdf = async (docs, docLabels) => {
    try {
        const cdl = docs.cdl;
        const med = docs.med_card;

        let pages = '';

        // 🔥 CDL FIRST
        if (cdl?.localUri) {
            const base64 = await toBase64(cdl.localUri);
            const ext = cdl.localUri.split('.').pop().toLowerCase();
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

            pages += `
                <div style="page-break-after: always; text-align:center;">
                    <h3 style="font-family:sans-serif;">${docLabels.cdl}</h3>
                    <img src="data:${mime};base64,${base64}"
                        style="width:100%;object-fit:contain;" />
                </div>
            `;
        }

        // 🔥 MED CARD SECOND
        if (med?.localUri) {
            const base64 = await toBase64(med.localUri);
            const ext = med.localUri.split('.').pop().toLowerCase();
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

            pages += `
                <div style="page-break-after: always; text-align:center;">
                    <h3 style="font-family:sans-serif;">${docLabels.med_card}</h3>
                    <img src="data:${mime};base64,${base64}"
                        style="width:100%;object-fit:contain;" />
                </div>
            `;
        }

        const html = `
            <html>
                <body style="margin:0;padding:20px;">
                    ${pages}
                </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });

        return uri.startsWith('file://') ? uri : `file://${uri}`;
    } catch (e) {
        console.log('PDF ERROR:', e);
        throw e;
    }
};
