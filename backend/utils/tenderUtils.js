const fs = require('fs');
const path = require('path');

const saveFileFromDataUrl = async (dataUrl) => {
    // 1. Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 2. Parse data URL
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URL format');
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 3. Generate unique filename
    const extension = mimeType.split('/')[1] || 'bin';
    const uniqueFilename = `doc_${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // 4. Write file to disk
    await fs.promises.writeFile(filePath, buffer);

    // 5. Return the new URL
    return `/uploads/${uniqueFilename}`;
};

const createDocumentFromUpload = async (uploadedFile, assignedTo) => {
    if (!uploadedFile || !uploadedFile.dataUrl) {
        return [];
    }
    
    const fileUrl = await saveFileFromDataUrl(uploadedFile.dataUrl);

    return [{
        id: `doc${Date.now()}`,
        name: uploadedFile.name,
        url: fileUrl,
        type: 'Tender Notice',
        mimeType: uploadedFile.mimeType,
        uploadedAt: new Date().toISOString(),
        uploadedById: assignedTo && assignedTo.length > 0 ? assignedTo[0] : 'system',
    }];
};

module.exports = {
    createDocumentFromUpload,
    saveFileFromDataUrl,
};
