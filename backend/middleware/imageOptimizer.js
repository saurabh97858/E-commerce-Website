const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const optimizeUploadedImages = async (req, res, next) => {
    // If no files were uploaded, continue
    const hasFiles = req.files && req.files.length > 0;
    const hasFile = !!req.file;

    if (!hasFiles && !hasFile) {
        return next();
    }

    try {
        const filesToProcess = hasFiles ? req.files : [req.file];

        for (const file of filesToProcess) {
            if (!file.path) continue;
            
            const ext = path.extname(file.originalname).toLowerCase();
            if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
                continue;
            }

            // Read original file buffer
            const imageBuffer = fs.readFileSync(file.path);

            let pipeline = sharp(imageBuffer)
                .resize({ width: 800, withoutEnlargement: true });

            if (ext === '.png') {
                pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
            } else {
                pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
            }

            const optimizedBuffer = await pipeline.toBuffer();

            // Overwrite original file
            fs.writeFileSync(file.path, optimizedBuffer);

            // Update file size in multer file object to match the optimized file
            file.size = optimizedBuffer.length;
        }
    } catch (err) {
        console.error('[IMAGE OPTIMIZER ERROR] Failed to compress image:', err.message);
        // Fail silently and proceed to next middleware so the upload doesn't break entirely
    }

    next();
};

module.exports = { optimizeUploadedImages };
