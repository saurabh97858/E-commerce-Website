/**
 * Migration script: Convert base64 images in MongoDB to files on disk
 * This converts heavy base64 strings to lightweight file paths
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const Product = require('./models/Product');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

function base64ToFile(base64String, filename) {
    // Extract the mime type and data
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return null;
    }

    const mimeType = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Determine extension from mime type
    const extMap = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
    };
    const ext = extMap[mimeType] || '.jpg';
    const fullFilename = filename + ext;
    const filepath = path.join(uploadsDir, fullFilename);

    fs.writeFileSync(filepath, buffer);
    return `/uploads/${fullFilename}`;
}

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });
        console.log('Connected!\n');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process.\n`);

        let converted = 0;
        let skipped = 0;

        for (const product of products) {
            let changed = false;
            const newImages = [];

            for (let i = 0; i < product.images.length; i++) {
                const img = product.images[i];

                if (img && img.startsWith('data:')) {
                    // It's a base64 image — convert to file
                    const filename = `${product._id}_${i}_${Date.now()}`;
                    const filePath = base64ToFile(img, filename);

                    if (filePath) {
                        newImages.push(filePath);
                        changed = true;
                        console.log(`  ✅ Product "${product.name}" image ${i + 1}: converted (${(img.length / 1024).toFixed(0)}KB base64 → file)`);
                    } else {
                        newImages.push(img); // Keep as-is if conversion fails
                        console.log(`  ⚠️ Product "${product.name}" image ${i + 1}: could not parse base64`);
                    }
                } else {
                    // Already a file path or URL — keep it
                    newImages.push(img);
                }
            }

            if (changed) {
                product.images = newImages;
                await product.save();
                converted++;
                console.log(`  → Saved product "${product.name}"\n`);
            } else {
                skipped++;
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Converted: ${converted} products`);
        console.log(`   Skipped (already file paths): ${skipped} products`);
    } catch (error) {
        console.error('Migration error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

migrate();
