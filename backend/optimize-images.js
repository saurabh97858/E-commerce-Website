const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadsDir = path.join(__dirname, 'uploads');

async function optimizeImages() {
    try {
        if (!fs.existsSync(uploadsDir)) {
            console.log('Uploads directory does not exist.');
            return;
        }

        const files = fs.readdirSync(uploadsDir);
        console.log(`Found ${files.length} files in uploads directory. Starting optimization...\n`);

        let optimizedCount = 0;
        let errorCount = 0;

        for (const file of files) {
            const filepath = path.join(uploadsDir, file);
            const ext = path.extname(file).toLowerCase();

            // Only process jpg, jpeg, png files
            if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
                console.log(`  - Skipping non-image file: ${file}`);
                continue;
            }

            try {
                const statsBefore = fs.statSync(filepath);
                const sizeBeforeKB = statsBefore.size / 1024;

                if (sizeBeforeKB < 100) {
                    console.log(`  - Skipping already small file (${sizeBeforeKB.toFixed(1)} KB): ${file}`);
                    continue;
                }

                // Read image into buffer
                const imageBuffer = fs.readFileSync(filepath);
                
                // Initialize sharp pipeline
                let pipeline = sharp(imageBuffer)
                    .resize({ width: 800, withoutEnlargement: true }); // Resize to max width 800px

                // Apply format-specific compression options
                if (ext === '.png') {
                    pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
                } else {
                    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
                }

                const outputBuffer = await pipeline.toBuffer();
                
                // Overwrite the file with optimized buffer
                fs.writeFileSync(filepath, outputBuffer);

                const sizeAfterKB = outputBuffer.length / 1024;
                const savingsPercent = ((sizeBeforeKB - sizeAfterKB) / sizeBeforeKB) * 100;

                console.log(`  ✅ Optimized: ${file}`);
                console.log(`     Size: ${sizeBeforeKB.toFixed(1)} KB → ${sizeAfterKB.toFixed(1)} KB (-${savingsPercent.toFixed(1)}%)`);
                optimizedCount++;
            } catch (err) {
                console.error(`  ❌ Error processing ${file}:`, err.message);
                errorCount++;
            }
        }

        console.log(`\n🎉 Image optimization complete!`);
        console.log(`   Successfully optimized: ${optimizedCount} images`);
        console.log(`   Errors encountered: ${errorCount}`);
    } catch (err) {
        console.error('Optimization runner error:', err.message);
    }
}

optimizeImages();
