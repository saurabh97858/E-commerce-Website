const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
} else {
    console.log("No .env found in current dir:", process.cwd());
}

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const products = await Product.find({}, 'name images');
        for (const p of products) {
            console.log(`Product: ${p.name}`);
            if (p.images && p.images.length > 0) {
                console.log('Images:', p.images.map(i => typeof i === 'string' ? i.substring(0, 50) + '...' : i));
            } else {
                console.log('Images: []');
            }
        }
        mongoose.disconnect();
    })
    .catch(console.error);
