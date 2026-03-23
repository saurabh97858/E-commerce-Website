const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User'); // Check if needed, but Product is the main one
const Product = require('./models/Product');

dotenv.config();

const cleanup = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const products = await Product.find({ 'images.0': { $regex: /^data:/ } });
        console.log(`Found ${products.length} products with base64 images.`);

        for (const product of products) {
            console.log(`Cleaning up product: ${product.name}`);
            // For safety, we'll just clear the images array or set to placeholder
            // since we don't have the original files anymore if they were only base64
            // But actually, the multer saved them to /uploads/ before controller converted them!
            // However, we don't know which file belongs to which product if we only have base64 in DB.
            
            // For now, let's just clear these large strings to restore performance.
            // The user can re-upload images for these products.
            product.images = []; 
            await product.save();
        }

        console.log('Cleanup complete. Performance should be restored.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanup();
