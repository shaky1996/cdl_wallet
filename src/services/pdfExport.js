import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';

export const imageToPdf = async (imageUri, docLabel) => {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64
    });

    const ext = imageUri.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

    const html = `
    <html><body style="margin:0;padding:0;background:#fff;">
      <div style="text-align:center;padding:20px 0 8px;font-family:sans-serif;
                  font-size:13px;color:#666;">${docLabel}</div>
      <img src="data:${mimeType};base64,${base64}"
           style="width:100%;max-width:700px;display:block;margin:0 auto;" />
    </body></html>
  `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
};
