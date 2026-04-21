import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';



const toBase64 = async (uri) => {
    return await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64'
    });
};


export const imageToPdf = async (docs, docLabels) => {
    try {
        let pages = '';

        for (const key of Object.keys(docs)) {
            const doc = docs[key];

            if (!doc?.localUri) continue;

            const base64 = await FileSystem.readAsStringAsync(doc.localUri, {
                encoding: 'base64'
            });

            const ext = doc.localUri.split('.').pop().toLowerCase();
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

            pages += `
                <div style="page-break-after: always; text-align:center;">
                    <h3 style="font-family:sans-serif;">${docLabels[key]}</h3>
                    <img 
                        src="data:${mime};base64,${base64}" 
                        style="width:100%; height:auto;" 
                    />
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
